import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type HasDataPlace = {
  title?: string
  name?: string
  phone?: string
  address?: string
  website?: string
  type?: string
  rating?: number | string
  reviews?: number | string
  placeId?: string
  dataId?: string
}

export async function POST(request: Request) {
  const apiKey = process.env.HASDATA_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'A chave HASDATA_API_KEY não foi encontrada nas variáveis de ambiente da Vercel. Confira o nome e faça um novo deploy.' },
      { status: 503 },
    )
  }

  let body: { niche?: unknown; city?: unknown; state?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Envie os dados da pesquisa em formato válido.' }, { status: 400 })
  }

  const niche = typeof body.niche === 'string' ? body.niche.trim().slice(0, 100) : ''
  const city = typeof body.city === 'string' ? body.city.trim().slice(0, 100) : ''
  const state = typeof body.state === 'string' ? body.state.trim().slice(0, 2).toUpperCase() : ''

  if (!niche || !city || !state) {
    return NextResponse.json({ error: 'Informe o nicho, a cidade e a sigla do estado.' }, { status: 400 })
  }

  const params = new URLSearchParams({
    q: `${niche} ${city} ${state} Brasil`,
    gl: 'br',
    hl: 'pt',
  })

  try {
    const response = await fetch(`https://api.hasdata.com/scrape/google-maps/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: 'A HasData recusou a chave. Confira se a chave está correta e ativa na Vercel.' }, { status: 502 })
      }
      if (response.status === 429) {
        return NextResponse.json({ error: 'Limite de solicitações da HasData atingido. Aguarde um pouco e tente novamente.' }, { status: 429 })
      }
      return NextResponse.json({ error: `A HasData retornou um erro (HTTP ${response.status}). Tente novamente mais tarde.` }, { status: 502 })
    }

    const payload = await response.json() as { localResults?: HasDataPlace[]; places?: HasDataPlace[]; results?: HasDataPlace[] }
    const places = payload.localResults ?? payload.places ?? payload.results ?? []
    const results = places.map((place) => ({
      name: String(place.title ?? place.name ?? '').trim(),
      phone: place.phone ?? '',
      address: place.address ?? '',
      website: place.website ?? '',
      type: place.type ?? '',
      rating: place.rating,
      reviews: place.reviews,
      placeId: place.placeId ?? place.dataId ?? '',
    })).filter((place) => place.name)

    return NextResponse.json({ results, count: results.length })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'A pesquisa demorou demais. Tente novamente.' }, { status: 504 })
    }
    return NextResponse.json({ error: 'Não foi possível conectar à HasData. Verifique a conexão e tente novamente.' }, { status: 502 })
  }
}
