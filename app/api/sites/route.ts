import { NextRequest, NextResponse } from 'next/server'

const getConfig = () => ({
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY,
})

export async function GET(request: NextRequest) {
  const { url, key } = getConfig()
  if (!url || !key) return NextResponse.json({ error: 'Backend Supabase não configurado.' }, { status: 500 })

  const slug = request.nextUrl.searchParams.get('slug')
  const query = slug
    ? `?slug=eq.${encodeURIComponent(slug)}&select=id,slug,site_data,payment_status,site_status,pix_key,price,created_at,paid_at,published_at&limit=1`
    : '?select=id,slug,site_data,payment_status,site_status,pix_key,price,created_at,paid_at,published_at&order=created_at.desc&limit=500'

  const response = await fetch(`${url}/rest/v1/prospecmap_sites${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: 'Não foi possível carregar os sites.' }, { status: 502 })
  if (slug) {
    const site = Array.isArray(data) ? data[0] : null
    if (!site) return NextResponse.json({ error: 'Prévia não encontrada.' }, { status: 404 })
    return NextResponse.json({ site })
  }
  return NextResponse.json({ sites: data })
}

export async function POST(request: NextRequest) {
  const { url, key } = getConfig()
  if (!url || !key) return NextResponse.json({ error: 'Backend Supabase não configurado.' }, { status: 500 })

  const body = await request.json().catch(() => null)
  const lead = body?.lead
  const pixKey = typeof body?.pixKey === 'string' ? body.pixKey.trim() : ''
  const price = Number(body?.price)
  if (!lead || typeof lead.name !== 'string' || typeof lead.niche !== 'string' || typeof lead.city !== 'string' || typeof lead.state !== 'string') {
    return NextResponse.json({ error: 'Dados da empresa inválidos.' }, { status: 400 })
  }
  if (!pixKey || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'Informe a chave Pix e um valor maior que zero.' }, { status: 400 })
  }

  const slugBase = lead.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'site'
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`
  const siteData = {
    leadId: String(lead.id || ''),
    name: String(lead.name).slice(0, 160),
    niche: String(lead.niche).slice(0, 100),
    city: String(lead.city).slice(0, 100),
    state: String(lead.state).slice(0, 2),
    country: String(lead.country || 'Brasil').slice(0, 80),
    whatsapp: String(lead.whatsapp || '').replace(/\D/g, '').slice(0, 20),
  }

  const response = await fetch(`${url}/rest/v1/prospecmap_sites?select=id,slug,site_data,payment_status,site_status,pix_key,price,created_at,paid_at,published_at`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ slug, site_data: siteData, pix_key: pixKey, price, payment_status: 'pending', site_status: 'preview' }),
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) return NextResponse.json({ error: 'Não foi possível criar a prévia.' }, { status: 502 })
  return NextResponse.json({ site: Array.isArray(data) ? data[0] : data }, { status: 201 })
}
