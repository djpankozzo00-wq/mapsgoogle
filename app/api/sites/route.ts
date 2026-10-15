import { NextRequest, NextResponse } from 'next/server'

const config = () => ({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_ANON_KEY })
type Lead = { id?: string; name: string; niche: string; city: string; state: string; country?: string; whatsapp?: string; notes?: string }
type Design = { headline: string; subheadline: string; aboutTitle: string; aboutText: string; services: { title: string; description: string }[]; features: string[]; primaryColor: string; accentColor: string; backgroundColor: string; heroImage: string; ctaText: string; style: string }

function makeDesign(lead: Lead): Design {
  const n = lead.niche.toLowerCase()
  const restaurant = /restaurante|pizz|lanch|hamburg|caf[eé]|bar|doceria|padaria|comida/.test(n)
  const barber = /barbear|barber/.test(n)
  const health = /cl[ií]nica|dent|m[eé]dic|sa[uú]de|fisioterap/.test(n)
  const beauty = /sal[aã]o|beleza|est[eé]tica|unha|cabelo/.test(n)
  const auto = /oficina|auto|mec[aâ]nica/.test(n)
  const heroImage = restaurant ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85' : barber ? 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1800&q=85' : health ? 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1800&q=85' : beauty ? 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=85' : auto ? 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1800&q=85' : /loja|moda|roupa|boutique/.test(n) ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85' : 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85'
  const primaryColor = restaurant ? '#713b25' : barber ? '#111827' : health ? '#0f766e' : beauty ? '#9d5477' : auto ? '#1d4ed8' : '#334155'
  const accentColor = restaurant ? '#e9b872' : barber ? '#d6b779' : health ? '#5eead4' : beauty ? '#f0b7cf' : auto ? '#f59e0b' : '#c5a46d'
  const services = restaurant ? [{title:'Cardápio',description:'Consulte as opções disponíveis diretamente com a equipe.'},{title:'Pedidos e encomendas',description:'Fale conosco para combinar seu pedido.'},{title:'Visite-nos',description:'Confirme endereço e disponibilidade antes da visita.'}] : barber ? [{title:'Cortes e estilo',description:'Converse com o profissional sobre o estilo que procura.'},{title:'Barba',description:'Consulte opções de cuidado e acabamento.'},{title:'Agendamento',description:'Fale com a equipe para verificar horários.'}] : health ? [{title:'Atendimento',description:'Conheça os atendimentos oferecidos pela clínica.'},{title:'Informações',description:'Tire dúvidas sobre localização e disponibilidade.'},{title:'Agendamento',description:'Consulte horários diretamente com a equipe.'}] : beauty ? [{title:'Cuidados e beleza',description:'Conheça as opções de atendimento disponíveis.'},{title:'Serviços',description:'Consulte os detalhes com a equipe.'},{title:'Agendamento',description:'Verifique os horários disponíveis.'}] : auto ? [{title:'Serviços automotivos',description:'Explique à equipe o que seu veículo precisa.'},{title:'Orçamento',description:'Consulte os detalhes do serviço desejado.'},{title:'Atendimento',description:'Confirme disponibilidade e horário.'}] : [{title:'Nossos serviços',description:'Conheça as opções disponíveis para você.'},{title:'Atendimento personalizado',description:'Tire dúvidas diretamente com a equipe.'},{title:'Fale conosco',description:'Consulte disponibilidade, horários e localização.'}]
  return { headline: restaurant ? 'Uma experiência feita para você' : barber ? 'Seu estilo. Seu momento.' : health ? 'Cuidado e atenção em cada etapa' : beauty ? 'Realce o melhor de você' : auto ? 'Cuidado e confiança para seu veículo' : 'Qualidade no atendimento, perto de você', subheadline: `Conheça ${lead.name}, em ${lead.city}, ${lead.state}. Explore nosso espaço e entre em contato para saber mais.`, aboutTitle: restaurant ? 'Sabor, acolhimento e bons momentos' : barber ? 'Mais que um corte, seu estilo' : health ? 'Atendimento com atenção às suas necessidades' : beauty ? 'Seu cuidado começa aqui' : auto ? 'Seu veículo em boas mãos' : 'Conheça nossa empresa', aboutText: `${lead.name} está em ${lead.city}, ${lead.state}. Entre em contato para confirmar serviços disponíveis, horários e demais informações diretamente com a equipe.`, services, features: ['Contato direto com a equipe', `Atendimento em ${lead.city}`, 'Informações claras e acessíveis'], primaryColor, accentColor, backgroundColor: restaurant || barber ? '#111827' : '#f8fafc', heroImage, ctaText: restaurant ? 'Conheça nosso espaço' : health ? 'Entre em contato' : 'Fale conosco', style: restaurant ? 'editorial-gastronomico' : barber ? 'premium-escuro' : health ? 'clean-clinico' : beauty ? 'elegante-beleza' : auto ? 'tecnico-moderno' : 'corporativo-moderno' }
}

async function generateDesign(lead: Lead) {
  const fallback = makeDesign(lead)
  const apiKey = process.env.V0_API_KEY
  if (!apiKey) return { design: fallback, generator: 'personalizado', generationMessage: 'A variável V0_API_KEY não está disponível nesta execução da aplicação.' }
  try {
    // A antiga Models API /v1/chat/completions retorna 404. Usar a Platform API atual.
    const response = await fetch('https://v0.app/api/v2/chats', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Gere somente um objeto JSON válido, sem markdown ou texto fora do JSON, com estas propriedades: headline, subheadline, aboutTitle, aboutText, services (3 a 4 objetos title/description), features (array), primaryColor, accentColor, backgroundColor, ctaText e style. Crie conteúdo e paleta distintos para o ramo. Não invente preços, avaliações, depoimentos, prêmios, qualificações ou fatos não fornecidos. Cores hex de 6 dígitos.\n\nEmpresa: ${lead.name}; segmento: ${lead.niche}; cidade: ${lead.city}; estado: ${lead.state}; informações adicionais: ${(lead.notes || 'nenhuma').slice(0, 900)}. Escreva em português brasileiro e devolva apenas o JSON solicitado.`,
        systemPrompt: 'Você é diretor de criação de sites profissionais para pequenos negócios brasileiros. Sua resposta deve ser somente o JSON solicitado.',
        modelId: 'v0-pro',
        imageGenerations: false,
        privacy: 'private'
      }),
      signal: AbortSignal.timeout(30000),
      cache: 'no-store'
    })
    if (!response.ok) {
      const providerBody = await response.text().catch(() => '')
      let providerMessage = ''
      try {
        const parsedError = JSON.parse(providerBody)
        providerMessage = typeof parsedError?.error?.message === 'string' ? parsedError.error.message : typeof parsedError?.message === 'string' ? parsedError.message : ''
      } catch {}
      console.error('[v0-generation] Platform API respondeu com status', response.status, providerMessage.slice(0, 300))
      const safeMessage = providerMessage ? `Detalhe informado pela API: ${providerMessage.slice(0, 240)}` : providerBody ? `Resposta da API: ${providerBody.slice(0, 240)}` : 'A API não informou o motivo específico.'
      return { design: fallback, generator: 'personalizado', generationMessage: `A API v0 Platform respondeu com erro HTTP ${response.status}. ${safeMessage} Confira a chave e o acesso à API Platform.` }
    }
    const result = await response.json()
    const lastMessage = Array.isArray(result?.messages) ? result.messages.slice(-1)[0] : null
    const content = typeof result?.text === 'string' ? result.text : typeof result?.content === 'string' ? result.content : typeof lastMessage?.content === 'string' ? lastMessage.content : Array.isArray(lastMessage?.parts) ? lastMessage.parts.map((part: any) => typeof part?.text === 'string' ? part.text : '').join('') : ''
    if (!content) {
      console.error('[v0-generation] Platform API respondeu sem texto', JSON.stringify({ id: result?.id, status: result?.latestVersion?.status }))
      return { design: fallback, generator: 'personalizado', generationMessage: 'A API v0 respondeu, mas não retornou texto utilizável. Tente novamente e confira o status da geração na API.' }
    }
    const cleaned = content.replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/, '').trim()
    const jsonStart = cleaned.indexOf('{')
    const jsonEnd = cleaned.lastIndexOf('}')
    const parsed = JSON.parse(jsonStart >= 0 && jsonEnd > jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned)
    const hex = (v: unknown, d: string) => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : d
    const strings = (v: unknown, d: string[]) => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, 4) : d
    const services = Array.isArray(parsed.services) ? parsed.services.filter((x: any) => typeof x?.title === 'string' && typeof x?.description === 'string').slice(0, 4) : fallback.services
    return { generator: 'v0-ai', design: { headline: typeof parsed.headline === 'string' ? parsed.headline.slice(0,140) : fallback.headline, subheadline: typeof parsed.subheadline === 'string' ? parsed.subheadline.slice(0,360) : fallback.subheadline, aboutTitle: typeof parsed.aboutTitle === 'string' ? parsed.aboutTitle.slice(0,140) : fallback.aboutTitle, aboutText: typeof parsed.aboutText === 'string' ? parsed.aboutText.slice(0,700) : fallback.aboutText, services: services.length ? services : fallback.services, features: strings(parsed.features, fallback.features), primaryColor: hex(parsed.primaryColor, fallback.primaryColor), accentColor: hex(parsed.accentColor, fallback.accentColor), backgroundColor: hex(parsed.backgroundColor, fallback.backgroundColor), heroImage: fallback.heroImage, ctaText: typeof parsed.ctaText === 'string' ? parsed.ctaText.slice(0,50) : fallback.ctaText, style: typeof parsed.style === 'string' ? parsed.style.slice(0,60) : fallback.style } }
  } catch (error) {
    console.error('[v0-generation] Falha na Platform API:', error instanceof Error ? error.message : 'erro desconhecido')
    const message = error instanceof Error && error.name === 'TimeoutError'
      ? 'A API v0 demorou demais para responder (tempo limite de 30 segundos).'
      : 'Não foi possível concluir a geração com a API v0 Platform. Confira a chave, o acesso à API e os registros da Vercel.'
    return { design: fallback, generator: 'personalizado', generationMessage: message }
  }
}

export async function GET(request: NextRequest) {
  const { url, key } = config()
  if (!url || !key) return NextResponse.json({ error: 'Backend Supabase não configurado.' }, { status: 500 })
  const slug = request.nextUrl.searchParams.get('slug')
  if (slug) {
    const response = await fetch(`${url}/rest/v1/rpc/prospecmap_get_public_site`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_slug: slug }), cache: 'no-store' })
    const site = await response.json().catch(() => null)
    if (!response.ok) return NextResponse.json({ error: 'Não foi possível carregar a prévia.' }, { status: 502 })
    if (!site) return NextResponse.json({ error: 'Prévia não encontrada.' }, { status: 404 })
    return NextResponse.json({ site })
  }
  const token = request.headers.get('x-admin-token') || ''
  if (!token) return NextResponse.json({ error: 'Informe a credencial administrativa para carregar os sites.' }, { status: 401 })
  const response = await fetch(`${url}/rest/v1/rpc/prospecmap_admin_list`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_token: token }), cache: 'no-store' })
  const data = await response.json().catch(() => null)
  if (!response.ok) return NextResponse.json({ error: 'Credencial administrativa inválida.' }, { status: 403 })
  return NextResponse.json({ sites: Array.isArray(data) ? data : [] })
}

export async function POST(request: NextRequest) {
  const { url, key } = config()
  if (!url || !key) return NextResponse.json({ error: 'Backend Supabase não configurado.' }, { status: 500 })
  const body = await request.json().catch(() => null)
  const lead = body?.lead as Lead | undefined
  const pixKey = typeof body?.pixKey === 'string' ? body.pixKey.trim() : ''
  const price = Number(body?.price)
  if (!lead || typeof lead.name !== 'string' || typeof lead.niche !== 'string' || typeof lead.city !== 'string' || typeof lead.state !== 'string') return NextResponse.json({ error: 'Dados da empresa inválidos.' }, { status: 400 })
  if (!pixKey || !Number.isFinite(price) || price <= 0) return NextResponse.json({ error: 'Informe a chave Pix e um valor maior que zero.' }, { status: 400 })
  const { design, generator, generationMessage } = await generateDesign(lead)
  const base = lead.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'site'
  const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`
  const siteData = { leadId: String(lead.id || ''), name: String(lead.name).slice(0, 160), niche: String(lead.niche).slice(0, 100), city: String(lead.city).slice(0, 100), state: String(lead.state).slice(0, 2), country: String(lead.country || 'Brasil').slice(0, 80), whatsapp: String(lead.whatsapp || '').replace(/\D/g, '').slice(0, 20), notes: String(lead.notes || '').slice(0, 1500), design, generator }
  const response = await fetch(`${url}/rest/v1/prospecmap_sites?select=id,slug,site_data,payment_status,site_status,pix_key,price,created_at,paid_at,published_at`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ slug, site_data: siteData, pix_key: pixKey, price, payment_status: 'pending', site_status: 'preview' }), cache: 'no-store' })
  if (!response.ok) { const error = await response.text().catch(() => ''); return NextResponse.json({ error: error.includes('row-level security') ? 'O banco bloqueou a criação da prévia. Verifique as permissões do projeto.' : 'Não foi possível criar a prévia.' }, { status: 502 }) }
  const lookup = await fetch(`${url}/rest/v1/rpc/prospecmap_get_public_site`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_slug: slug }), cache: 'no-store' })
  const site = await lookup.json().catch(() => null)
  if (!lookup.ok || !site) return NextResponse.json({ error: 'A prévia foi criada, mas não foi possível carregar seus dados.' }, { status: 502 })
  return NextResponse.json({ site, generator, generationMessage }, { status: 201 })
}
