import { NextRequest, NextResponse } from 'next/server'

const config = () => ({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY })

export async function GET(request: NextRequest) {
  const { url, key } = config()
  if (!url || !key) return NextResponse.json({ error: 'Backend Supabase não configurado.' }, { status: 500 })
  const slug = request.nextUrl.searchParams.get('slug')
  if (slug) {
    const response = await fetch(`${url}/rest/v1/rpc/prospecmap_get_public_site`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_slug: slug }),
      cache: 'no-store',
    })
    const site = await response.json().catch(() => null)
    if (!response.ok) return NextResponse.json({ error: 'Não foi possível carregar a prévia.' }, { status: 502 })
    if (!site) return NextResponse.json({ error: 'Prévia não encontrada.' }, { status: 404 })
    return NextResponse.json({ site })
  }

  const token = request.headers.get('x-admin-token') || ''
  if (!token) return NextResponse.json({ error: 'Informe a credencial administrativa para carregar os sites.' }, { status: 401 })
  const response = await fetch(`${url}/rest/v1/rpc/prospecmap_admin_list`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_token: token }),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) return NextResponse.json({ error: 'Credencial administrativa inválida.' }, { status: 403 })
  return NextResponse.json({ sites: Array.isArray(data) ? data : [] })
}

export async function POST(request: NextRequest) {
  const { url, key } = config()
  if (!url || !key) return NextResponse.json({ error: 'Backend Supabase não configurado.' }, { status: 500 })
  const body = await request.json().catch(() => null)
  const lead = body?.lead
  const pixKey = typeof body?.pixKey === 'string' ? body.pixKey.trim() : ''
  const price = Number(body?.price)
  if (!lead || typeof lead.name !== 'string' || typeof lead.niche !== 'string' || typeof lead.city !== 'string' || typeof lead.state !== 'string') return NextResponse.json({ error: 'Dados da empresa inválidos.' }, { status: 400 })
  if (!pixKey || !Number.isFinite(price) || price <= 0) return NextResponse.json({ error: 'Informe a chave Pix e um valor maior que zero.' }, { status: 400 })
  const base = lead.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'site'
  const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`
  const siteData = { leadId: String(lead.id || ''), name: String(lead.name).slice(0, 160), niche: String(lead.niche).slice(0, 100), city: String(lead.city).slice(0, 100), state: String(lead.state).slice(0, 2), country: String(lead.country || 'Brasil').slice(0, 80), whatsapp: String(lead.whatsapp || '').replace(/\D/g, '').slice(0, 20) }
  const response = await fetch(`${url}/rest/v1/prospecmap_sites?select=id,slug,site_data,payment_status,site_status,pix_key,price,created_at,paid_at,published_at`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ slug, site_data: siteData, pix_key: pixKey, price, payment_status: 'pending', site_status: 'preview' }),
    cache: 'no-store',
  })
  if (!response.ok) { const error = await response.text().catch(() => ''); return NextResponse.json({ error: error.includes('row-level security') ? 'O banco bloqueou a criação da prévia. Verifique as permissões do projeto.' : 'Não foi possível criar a prévia.' }, { status: 502 }) }
  const lookup = await fetch(`${url}/rest/v1/rpc/prospecmap_get_public_site`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_slug: slug }), cache: 'no-store' })
  const site = await lookup.json().catch(() => null)
  if (!lookup.ok || !site) return NextResponse.json({ error: 'A prévia foi criada, mas não foi possível carregar seus dados.' }, { status: 502 })
  return NextResponse.json({ site }, { status: 201 })
}
