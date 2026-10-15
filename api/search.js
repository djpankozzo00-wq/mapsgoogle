export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  try {
    const { query, apiKey } = request.body || {}
    const key = process.env.HASDATA_API_KEY || String(apiKey || '').trim()

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return response.status(400).json({ error: 'Informe uma busca válida.' })
    }
    if (!key) {
      return response.status(400).json({ error: 'API Key do HasData não informada.' })
    }

    const upstream = await fetch(`https://api.hasdata.com/scrape/google-maps/search?query=${encodeURIComponent(query.trim())}`, {
      method: 'GET',
      headers: { 'x-api-key': key, Accept: 'application/json' },
    })

    const payload = await upstream.json().catch(() => ({}))
    if (!upstream.ok) {
      return response.status(upstream.status).json({ error: payload.message || payload.error || 'O HasData recusou a busca.' })
    }

    const rawResults = Array.isArray(payload) ? payload : payload.data || payload.results || payload.places || []
    const leads = rawResults
      .filter((place) => !place.website)
      .map((place) => ({
        name: place.name || place.title || 'Empresa sem nome',
        niche: place.category || place.type || place.primaryCategory || 'Geral',
        city: place.city || place.address?.city || place.address?.locality || '',
        state: place.state || place.address?.state || place.address?.region || '',
        country: place.country || place.address?.country || 'Brasil',
        whatsapp: String(place.phone || place.phoneNumber || place.telephone || '').replace(/\D/g, ''),
        notes: place.address || place.fullAddress || 'Encontrada no Google Maps sem site.',
      }))

    return response.status(200).json({ leads })
  } catch (error) {
    return response.status(500).json({ error: 'Não foi possível consultar o HasData agora.' })
  }
}
