import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) return NextResponse.json({ error: 'Backend Supabase não configurado.' }, { status: 500 })
  const body = await request.json().catch(() => null)
  const token = typeof body?.token === 'string' ? body.token : ''
  const siteId = typeof body?.siteId === 'string' ? body.siteId : ''
  const action = typeof body?.action === 'string' ? body.action : ''
  if (!token || !siteId || !['confirm_payment', 'publish', 'unpublish'].includes(action)) return NextResponse.json({ error: 'Informe a credencial administrativa e uma ação válida.' }, { status: 400 })
  const response = await fetch(`${url}/rest/v1/rpc/prospecmap_admin_action`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_token: token, p_site_id: siteId, p_action: action }), cache: 'no-store' })
  const result = await response.json().catch(() => null)
  if (!response.ok) return NextResponse.json({ error: typeof result?.message === 'string' ? result.message : 'Não foi possível concluir a ação administrativa.' }, { status: response.status === 400 ? 400 : 403 })
  return NextResponse.json({ result })
}
