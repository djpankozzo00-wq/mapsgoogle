import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bucket = 'prospecmap-site-photos'
type Photo = { id: string; url: string; path: string; name: string; createdAt: string }

function config() {
  return {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ''),
    anon: process.env.SUPABASE_ANON_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
}

async function authorize(token: string, siteId: string) {
  const { url, anon } = config()
  if (!url || !anon) throw new Error('Supabase não está configurado.')
  const response = await fetch(`${url}/rest/v1/rpc/prospecmap_admin_list`, {
    method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: token }),
    cache: 'no-store',
  })
  const sites = await response.json().catch(() => null)
  if (!response.ok || !Array.isArray(sites)) throw new Error('Credencial administrativa inválida.')
  const site = sites.find((item: any) => String(item.id) === siteId)
  if (!site) throw new Error('Site não encontrado ou acesso administrativo negado.')
  return site
}

async function updateSiteData(site: any, siteData: Record<string, any>) {
  const { url, service } = config()
  if (!url || !service) throw new Error('Configure SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel para habilitar o envio seguro de fotos.')
  const nextData = { ...(site.site_data || {}), ...siteData }
  const response = await fetch(`${url}/rest/v1/prospecmap_sites?id=eq.${encodeURIComponent(site.id)}`, {
    method: 'PATCH',
    headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ site_data: nextData }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Não foi possível salvar as fotos no cadastro do site.')
}

export async function POST(request: NextRequest) {
  const { url, service } = config()
  if (!url || !service) return NextResponse.json({ error: 'Para habilitar o envio seguro, adicione SUPABASE_SERVICE_ROLE_KEY às variáveis de ambiente da Vercel.' }, { status: 500 })
  try {
    const form = await request.formData()
    const token = String(form.get('token') || '')
    const siteId = String(form.get('siteId') || '')
    const file = form.get('file')
    const kind = String(form.get('kind') || 'photo')
    if (!token || !siteId || !(file instanceof File)) return NextResponse.json({ error: 'Selecione uma imagem e informe o site.' }, { status: 400 })
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return NextResponse.json({ error: 'Use uma imagem JPG, PNG ou WebP.' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Cada imagem pode ter no máximo 5 MB.' }, { status: 400 })
    const site = await authorize(token, siteId)
    const current: Photo[] = Array.isArray(site.site_data?.photos) ? site.site_data.photos : []
    if (!['photo', 'logo'].includes(kind)) return NextResponse.json({ error: 'Tipo de imagem inválido.' }, { status: 400 })
    if (kind === 'photo' && current.length >= 12) return NextResponse.json({ error: 'Este site já tem 12 fotos. Exclua uma antes de enviar outra.' }, { status: 400 })
    if (kind === 'logo' && file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'O logotipo pode ter no máximo 2 MB.' }, { status: 400 })
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
    const path = `${siteId}/${kind}-${crypto.randomUUID()}.${ext}`
    const bytes = new Uint8Array(await file.arrayBuffer())
    const upload = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': file.type, 'x-upsert': 'false' },
      body: bytes,
      cache: 'no-store',
    })
    if (!upload.ok) {
      const details = await upload.text().catch(() => '')
      console.error('[site-photo-upload]', upload.status, details.slice(0, 300))
      return NextResponse.json({ error: 'O armazenamento recusou a imagem. Verifique o bucket de fotos no Supabase.' }, { status: 502 })
    }
    const photo: Photo = { id: crypto.randomUUID(), path, url: `${url}/storage/v1/object/public/${bucket}/${path}`, name: file.name.slice(0, 120), createdAt: new Date().toISOString() }
    try {
      if (kind === 'logo') {
        const oldLogoPath = typeof site.site_data?.logoPath === 'string' ? site.site_data.logoPath : ''
        await updateSiteData(site, { logoUrl: photo.url, logoPath: path })
        if (oldLogoPath) await fetch(`${url}/storage/v1/object/${bucket}/${oldLogoPath}`, { method: 'DELETE', headers: { apikey: service, Authorization: `Bearer ${service}` } }).catch(() => null)
      } else await updateSiteData(site, { photos: [...current, photo] })
    } catch (error) {
      await fetch(`${url}/storage/v1/object/${bucket}/${path}`, { method: 'DELETE', headers: { apikey: service, Authorization: `Bearer ${service}` } }).catch(() => null)
      throw error
    }
    return NextResponse.json(kind === 'logo' ? { logoUrl: photo.url } : { photo, photos: [...current, photo] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível enviar a imagem.' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const { url, service } = config()
  if (!url || !service) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel.' }, { status: 500 })
  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token : ''
    const siteId = typeof body?.siteId === 'string' ? body.siteId : ''
    const photoId = typeof body?.photoId === 'string' ? body.photoId : ''
    const kind = typeof body?.kind === 'string' ? body.kind : 'photo'
    if (!token || !siteId || (kind !== 'logo' && !photoId)) return NextResponse.json({ error: 'Dados incompletos para excluir a imagem.' }, { status: 400 })
    const site = await authorize(token, siteId)
    const current: Photo[] = Array.isArray(site.site_data?.photos) ? site.site_data.photos : []
    if (kind === 'logo') {
      const logoPath = typeof site.site_data?.logoPath === 'string' ? site.site_data.logoPath : ''
      await updateSiteData(site, { logoUrl: null, logoPath: null })
      if (logoPath) await fetch(`${url}/storage/v1/object/${bucket}/${logoPath}`, { method: 'DELETE', headers: { apikey: service, Authorization: `Bearer ${service}` } }).catch(() => null)
      return NextResponse.json({ logoUrl: null })
    }
    const target = current.find(photo => photo.id === photoId)
    if (!target) return NextResponse.json({ error: 'Foto não encontrada neste site.' }, { status: 404 })
    const photos = current.filter(photo => photo.id !== photoId)
    await updateSiteData(site, { photos })
    await fetch(`${url}/storage/v1/object/${bucket}/${target.path}`, { method: 'DELETE', headers: { apikey: service, Authorization: `Bearer ${service}` } }).catch(() => null)
    return NextResponse.json({ photos })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível excluir a foto.' }, { status: 400 })
  }
}
