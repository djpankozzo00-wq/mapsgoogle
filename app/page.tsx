'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import SitePhotoManager, { type SitePhoto } from '@/components/site-photo-manager'
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, ChevronDown, CirclePlus, ExternalLink, Filter, MapPin, MessageCircle, Pencil, Search, ShieldCheck, Sparkles, StickyNote, Trash2, X, MapPinned, LoaderCircle } from 'lucide-react'

type LeadStatus = 'A contactar' | 'Em negociação' | 'Fechado' | 'Rejeitado'
type WhatsappCheck = 'Não verificado' | 'Confirmado no WhatsApp' | 'Não encontrado no WhatsApp'
type Lead = { id: string; name: string; niche: string; city: string; state: string; country: string; status: LeadStatus; whatsapp: string; notes: string; whatsappCheck?: WhatsappCheck }\ntype DeletedCompany = { name: string; city: string; state: string; country: string; niche: string; cep: string; mapsUrl: string }
type SiteRecord = { id: string; slug: string; site_data: { leadId?: string; name: string; niche: string; city: string; state: string; country: string; whatsapp: string; photos?: SitePhoto[] }; payment_status: 'pending' | 'paid'; site_status: 'preview' | 'published'; pix_key: string; price: number }
const statuses: LeadStatus[] = ['A contactar', 'Em negociação', 'Fechado', 'Rejeitado']
const exampleLeads: Lead[] = [
  { id: 'example-1', name: 'Pizzaria Bella Napoli', niche: 'Pizzaria', city: 'Campinas', state: 'SP', country: 'Brasil', status: 'A contactar', whatsapp: '5519998765432', notes: 'Encontrada no Google Maps. Instagram ativo, mas sem site próprio.' },
  { id: 'example-2', name: 'Auto Center Horizonte', niche: 'Oficina', city: 'Belo Horizonte', state: 'MG', country: 'Brasil', status: 'Em negociação', whatsapp: '5531987654321', notes: 'Proprietário pediu para receber o portfólio na próxima semana.' },
  { id: 'example-3', name: 'Studio Corte & Estilo', niche: 'Salão de Beleza', city: 'Curitiba', state: 'PR', country: 'Brasil', status: 'Fechado', whatsapp: '5541987654321', notes: 'Projeto aprovado. Aguardando envio do briefing inicial.' },
]
const statusStyles: Record<LeadStatus, string> = { 'A contactar': 'bg-amber-50 text-[#9a7b3f] ring-amber-200', 'Em negociação': 'bg-blue-50 text-[#347d79] ring-blue-200', Fechado: 'bg-emerald-50 text-[#347d79] ring-emerald-200', Rejeitado: 'bg-slate-100 text-slate-500 ring-slate-200' }
const normalizePhone = (phone: string) => phone.replace(/\D/g, '')
const brazilStates = [{uf:'AC',name:'Acre'},{uf:'AL',name:'Alagoas'},{uf:'AP',name:'Amapá'},{uf:'AM',name:'Amazonas'},{uf:'BA',name:'Bahia'},{uf:'CE',name:'Ceará'},{uf:'DF',name:'Distrito Federal'},{uf:'ES',name:'Espírito Santo'},{uf:'GO',name:'Goiás'},{uf:'MA',name:'Maranhão'},{uf:'MT',name:'Mato Grosso'},{uf:'MS',name:'Mato Grosso do Sul'},{uf:'MG',name:'Minas Gerais'},{uf:'PA',name:'Pará'},{uf:'PB',name:'Paraíba'},{uf:'PR',name:'Paraná'},{uf:'PE',name:'Pernambuco'},{uf:'PI',name:'Piauí'},{uf:'RJ',name:'Rio de Janeiro'},{uf:'RN',name:'Rio Grande do Norte'},{uf:'RS',name:'Rio Grande do Sul'},{uf:'RO',name:'Rondônia'},{uf:'RR',name:'Roraima'},{uf:'SC',name:'Santa Catarina'},{uf:'SP',name:'São Paulo'},{uf:'SE',name:'Sergipe'},{uf:'TO',name:'Tocantins'}]
const businessNiches = [
  { group: "Alimentação e bebidas", items: ["Açaíteria","Adega","Bar","Bar de tapas","Bistrô","Buffet","Cafeteria","Cervejaria","Choperia","Churrascaria","Comida árabe","Comida chinesa","Comida japonesa","Comida mexicana","Comida vegana","Creperia","Doceria","Empório","Food truck","Hamburgueria","Lanchonete","Marmitaria","Padaria","Pastelaria","Pizzaria","Restaurante","Restaurante italiano","Restaurante self-service","Salgaderia","Sorveteria"] },
  { group: "Saúde e bem-estar", items: ["Acupuntura","Cardiologista","Clínica de exames","Clínica de fisioterapia","Clínica médica","Clínica odontológica","Dermatologista","Endocrinologista","Fonoaudiólogo","Ginecologista","Laboratório de análises clínicas","Médico","Nutricionista","Oftalmologista","Ortopedista","Pediatra","Psicólogo","Psiquiatra","Quiropraxia","Terapeuta ocupacional","Veterinário"] },
  { group: "Beleza e cuidados pessoais", items: ["Barbearia","Cabeleireiro","Clínica de estética","Depilação","Designer de sobrancelhas","Esmalteria","Maquiador","Manicure e pedicure","Massoterapia","Salão de beleza","Spa","Tatuador"] },
  { group: "Automóveis e transporte", items: ["Autoelétrica","Autoescola","Autopeças","Centro automotivo","Concessionária","Despachante veicular","Estacionamento","Funilaria e pintura","Guincho","Locadora de veículos","Lava-jato","Mecânica de motos","Oficina mecânica","Pneus e borracharia","Som automotivo","Transporte executivo"] },
  { group: "Comércio e lojas", items: ["Armarinho","Casa de materiais de construção","Depósito de bebidas","Loja de artigos esportivos","Loja de brinquedos","Loja de celulares","Loja de colchões","Loja de cosméticos","Loja de decoração","Loja de eletrônicos","Loja de informática","Loja de móveis","Loja de presentes","Loja de roupas","Loja de roupas infantis","Loja de calçados","Loja de variedades","Loja de instrumentos musicais","Loja de joias e bijuterias","Loja de produtos naturais","Loja de suplementos","Mercado","Papelaria","Perfumaria","Pet shop","Supermercado","Utilidades domésticas","Ótica"] },
  { group: "Casa, obras e manutenção", items: ["Ar-condicionado","Arquiteto","Chaveiro","Eletricista","Encanador","Energia solar","Empresa de reformas","Gesso e drywall","Jardinagem","Marcenaria","Marmoraria","Materiais elétricos","Materiais hidráulicos","Pedreiro","Pintor","Piscinas","Serralheria","Vidraçaria"] },
  { group: "Serviços profissionais", items: ["Advogado","Agência de publicidade","Agência de marketing digital","Assessoria empresarial","Contador","Consultoria","Corretor de seguros","Design gráfico","Despachante","Fotógrafo","Imobiliária","Imobiliária de aluguel por temporada","Tradutor","Recursos humanos"] },
  { group: "Educação e cursos", items: ["Autoescola","Berçário","Escola de idiomas","Escola particular","Escola técnica","Faculdade","Curso de informática","Curso profissionalizante","Curso preparatório","Creche","Professor particular","Reforço escolar"] },
  { group: "Turismo e hospedagem", items: ["Agência de turismo","Aluguel de temporada","Camping","Guia turístico","Hotel","Pousada","Resort","Passeios turísticos"] },
  { group: "Esportes e lazer", items: ["Academia","Arena esportiva","Escola de dança","Escola de futebol","Estúdio de pilates","Estúdio de yoga","Quadra esportiva","Personal trainer","Piscina e natação"] },
  { group: "Eventos e festas", items: ["Buffet para eventos","Casa de festas","Cerimonialista","Decoração de festas","DJ","Filmagem de eventos","Locação de brinquedos","Locação de equipamentos para festas","Organização de eventos","Salão de festas"] },
  { group: "Animais", items: ["Banho e tosa","Clínica veterinária","Hotel para animais","Pet shop","Adestrador de cães"] },
  { group: "Outros serviços locais", items: ["Assistência técnica","Costureira","Lavanderia","Lavagem de estofados","Dedetizadora","Funerária","Gráfica","Igreja","Organização sem fins lucrativos","Serviços de limpeza","Serviços de mudança","Segurança eletrônica","Segurança patrimonial","Telecomunicações","Outro segmento"] },
]
const allBusinessNiches = [...new Set(businessNiches.flatMap((group) => group.items))].sort((a, b) => a.localeCompare(b, 'pt-BR'))

export default function Page() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [deletedCompanyHistory, setDeletedCompanyHistory] = useState<Array<DeletedCompany | string>>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [nicheFilter, setNicheFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState<'Todos' | LeadStatus>('Todos')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [demoLead, setDemoLead] = useState<Lead | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapsNiche, setMapsNiche] = useState('')
  const [usedSearchCombos, setUsedSearchCombos] = useState<string[]>([])
  const [mapsCity, setMapsCity] = useState('')
  const [mapsState, setMapsState] = useState('')
  const [mapsCities, setMapsCities] = useState<string[]>([])
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [mapsLoading, setMapsLoading] = useState(false)
  const [mapsError, setMapsError] = useState('')
  const [mapsMessage, setMapsMessage] = useState('')
  const [sites, setSites] = useState<SiteRecord[]>([])
  const [adminToken, setAdminToken] = useState('')
  const [siteMessage, setSiteMessage] = useState('')
  const [siteBusy, setSiteBusy] = useState<string | null>(null)

  useEffect(() => { try { const saved = window.localStorage.getItem('prospecmap-used-search-combos'); setUsedSearchCombos(saved ? JSON.parse(saved) : []) } catch { setUsedSearchCombos([]) } }, [])
  useEffect(() => { window.localStorage.setItem('prospecmap-used-search-combos', JSON.stringify(usedSearchCombos)) }, [usedSearchCombos])
  useEffect(() => { const saved = window.localStorage.getItem('prospecmap-leads'); setLeads(saved ? JSON.parse(saved) : exampleLeads); setIsLoaded(true) }, [])
  useEffect(() => { try { const saved = window.localStorage.getItem('prospecmap-deleted-company-history'); setDeletedCompanyHistory(saved ? JSON.parse(saved) : []) } catch { setDeletedCompanyHistory([]) } finally { setHistoryLoaded(true) } }, [])
  useEffect(() => { if (historyLoaded) window.localStorage.setItem('prospecmap-deleted-company-history', JSON.stringify(deletedCompanyHistory)) }, [deletedCompanyHistory, historyLoaded])
  useEffect(() => { if (isLoaded) window.localStorage.setItem('prospecmap-leads', JSON.stringify(leads)) }, [leads, isLoaded])
  useEffect(() => {
    if (!mapsState) { setMapsCities([]); setMapsCity(''); return }
    let cancelled = false
    setCitiesLoading(true)
    setMapsCity('')
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${mapsState}/municipios?orderBy=nome`)
      .then((response) => { if (!response.ok) throw new Error('Não foi possível carregar as cidades'); return response.json() })
      .then((data: Array<{ nome: string }>) => { if (!cancelled) setMapsCities(data.map((city) => city.nome)) })
      .catch(() => { if (!cancelled) setMapsCities([]) })
      .finally(() => { if (!cancelled) setCitiesLoading(false) })
    return () => { cancelled = true }
  }, [mapsState])
  const loadSites = async () => {
    if (!adminToken.trim()) { setSiteMessage('Digite a credencial administrativa para carregar os sites.'); return }
    try {
      const response = await fetch('/api/sites', { headers: { 'x-admin-token': adminToken }, cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os sites.')
      setSites(Array.isArray(data.sites) ? data.sites : [])
      setSiteMessage('Lista de sites atualizada.')
    } catch (error) { setSiteMessage(error instanceof Error ? error.message : 'Erro ao carregar sites.') }
  }

  const createSitePreview = async (lead: Lead) => {
    const priceText = window.prompt('Qual será o valor do site em reais? Ex.: 299,90', '299,90')
    if (priceText === null) return
    const price = Number(priceText.trim().replace(',', '.'))
    if (!Number.isFinite(price) || price <= 0) { window.alert('Informe um valor válido maior que zero.'); return }
    const pixKey = window.prompt('Informe a chave Pix que será enviada ao cliente:')
    if (!pixKey?.trim()) return
    setSiteBusy(lead.id); setSiteMessage('Criando link de prévia...')
    try {
      const response = await fetch('/api/sites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead, price, pixKey: pixKey.trim() }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível criar a prévia.')
      setSites((current) => [data.site, ...current.filter((item) => item.id !== data.site.id)])
      const link = window.location.origin + '/site/' + data.site.slug
      const generationNote = data.generator === 'v0-ai' ? 'Site personalizado com IA v0.' : `A IA v0 não foi confirmada. Foi usado o layout por segmento. ${typeof data.generationMessage === 'string' ? data.generationMessage : 'Confira a configuração da API v0.'}`
      setSiteMessage(generationNote + ' Link criado: ' + link)
      try { await navigator.clipboard.writeText(link); setSiteMessage(generationNote + ' Link criado e copiado: ' + link) } catch {}
    } catch (error) { setSiteMessage(error instanceof Error ? error.message : 'Erro ao criar prévia.') }
    finally { setSiteBusy(null) }
  }

  const manageSite = async (site: SiteRecord, action: 'confirm_payment' | 'publish' | 'unpublish') => {
    if (!adminToken.trim()) { setSiteMessage('Digite a credencial administrativa para confirmar o Pix ou publicar.'); return }
    const confirmText = action === 'confirm_payment' ? 'Confirma que verificou o recebimento do Pix no banco?' : action === 'publish' ? 'Publicar este site agora?' : 'Retirar este site do ar?'
    if (!window.confirm(confirmText)) return
    setSiteBusy(site.id); setSiteMessage('Atualizando status do site...')
    try {
      const response = await fetch('/api/sites/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: adminToken, siteId: site.id, action }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar o site.')
      const refreshResponse = await fetch('/api/sites', { headers: { 'x-admin-token': adminToken }, cache: 'no-store' }); const refresh = await refreshResponse.json(); if (!refreshResponse.ok) throw new Error(refresh.error || 'Não foi possível atualizar a lista.')
      if (Array.isArray(refresh.sites)) setSites(refresh.sites)
      setSiteMessage(action === 'confirm_payment' ? 'Pix confirmado manualmente.' : action === 'publish' ? 'Site publicado com sucesso.' : 'Site retirado do ar.')
    } catch (error) { setSiteMessage(error instanceof Error ? error.message : 'Erro ao atualizar site.') }
    finally { setSiteBusy(null) }
  }

  const confirmPixAndPublish = async (site: SiteRecord) => {
    if (!adminToken.trim()) { setSiteMessage('Digite a credencial administrativa para confirmar o Pix e publicar.'); return }
    if (!window.confirm('Confirme somente se você já verificou no aplicativo do banco que o Pix deste cliente caiu na sua conta. O sistema marcará o pagamento como recebido e publicará o site.')) return
    setSiteBusy(site.id); setSiteMessage('Confirmando recebimento e publicando o site...')
    try {
      const requestAction = async (action: 'confirm_payment' | 'publish') => {
        const response = await fetch('/api/sites/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: adminToken, siteId: site.id, action }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Não foi possível atualizar o site.')
        return data
      }
      if (site.payment_status !== 'paid') await requestAction('confirm_payment')
      await requestAction('publish')
      const refreshResponse = await fetch('/api/sites', { headers: { 'x-admin-token': adminToken }, cache: 'no-store' })
      const refresh = await refreshResponse.json()
      if (!refreshResponse.ok) throw new Error(refresh.error || 'Pagamento processado, mas não foi possível atualizar a lista. Toque em Carregar sites.')
      if (Array.isArray(refresh.sites)) setSites(refresh.sites)
      setSiteMessage('Pix confirmado manualmente e site publicado com sucesso.')
    } catch (error) {
      setSiteMessage(error instanceof Error ? error.message : 'Erro ao confirmar Pix e publicar.')
    } finally { setSiteBusy(null) }
  }

  const niches = useMemo(() => [...new Set(leads.map((lead) => lead.niche))].sort(), [leads])
  const filteredLeads = useMemo(() => leads.filter((lead) => `${lead.name} ${lead.city} ${lead.state} ${lead.niche} ${lead.notes}`.toLowerCase().includes(search.toLowerCase()) && (nicheFilter === 'Todos' || lead.niche === nicheFilter) && (statusFilter === 'Todos' || lead.status === statusFilter)), [leads, search, nicheFilter, statusFilter])
  const openNew = () => { setEditingLead(null); setIsFormOpen(true) }
  const openEdit = (lead: Lead) => { setEditingLead(lead); setIsFormOpen(true) }
  const saveLead = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const data = { name: String(form.get('name') || '').trim(), niche: String(form.get('niche') || '').trim(), city: String(form.get('city') || '').trim(), state: String(form.get('state') || '').trim().toUpperCase(), country: String(form.get('country') || 'Brasil').trim(), status: String(form.get('status') || 'A contactar') as LeadStatus, whatsapp: normalizePhone(String(form.get('whatsapp') || '')), notes: String(form.get('notes') || '').trim() }; setLeads((current) => editingLead ? current.map((lead) => lead.id === editingLead.id ? { ...editingLead, ...data } : lead) : [{ id: crypto.randomUUID(), ...data }, ...current]); setIsFormOpen(false) }
  const leadKey = (lead: Pick<Lead, 'name' | 'city' | 'state'>) => [lead.name, lead.city, lead.state].map((value) => value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim().toLowerCase()).join('|')
  const removeLead = (id: string) => {
    const lead = leads.find((item) => item.id === id)
    if (!lead || !window.confirm('Excluir este lead? Ele também será marcado para não aparecer novamente nas próximas buscas.')) return
    try {
      const saved = JSON.parse(window.localStorage.getItem('prospecmap-excluded-leads') || '[]') as string[]
      const excluded = new Set(saved)
      excluded.add(leadKey(lead))
      window.localStorage.setItem('prospecmap-excluded-leads', JSON.stringify([...excluded]))
    } catch {}
    setDeletedCompanyHistory((current) => [{ name: lead.name, city: lead.city, state: lead.state, country: lead.country || 'Não informado', niche: lead.niche || 'Não informado', cep: lead.notes.match(/\b\d{5}-?\d{3}\b/)?.[0] || 'Não informado', mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.city} ${lead.state}`)}` }, ...current])
    setLeads((current) => current.filter((item) => item.id !== id))
  }
  const sendLeadToWhatsapp = (id: string) => {
    const lead = leads.find((item) => item.id === id)
    if (!lead) return
    try {
      const saved = JSON.parse(window.localStorage.getItem('prospecmap-excluded-leads') || '[]') as string[]
      const excluded = new Set(saved)
      excluded.add(leadKey(lead))
      window.localStorage.setItem('prospecmap-excluded-leads', JSON.stringify([...excluded]))
    } catch {}
    setDeletedCompanyHistory((current) => [{ name: lead.name, city: lead.city || 'Não informado', state: lead.state || '', country: lead.country || 'Não informado', niche: lead.niche || 'Não informado', cep: lead.notes.match(/\b\d{5}-?\d{3}\b/)?.[0] || 'Não informado', mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.name} ${lead.city} ${lead.state}`)}` }, ...current])
    setLeads((current) => current.filter((item) => item.id !== id))
  }
  const generateUniqueSearchCombo = () => {
    const normalize = (value: string) => value.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim().toLocaleLowerCase('pt-BR')
    const niches = allBusinessNiches
    const states = brazilStates
    const used = new Set(usedSearchCombos)
    try {
      const excluded = JSON.parse(window.localStorage.getItem('prospecmap-excluded-leads') || '[]') as string[]
      void excluded
    } catch {}
    const combos: Array<{ niche: string; state: string; city: string }> = []
    for (const niche of niches) for (const state of states) for (const city of mapsCities) {
      const key = [niche, city, state.uf].map(normalize).join('|')
      if (!used.has(key)) combos.push({ niche, city, state: state.uf })
    }
    if (!combos.length) {
      setMapsError('Todas as combinações disponíveis para as cidades carregadas já foram usadas. Escolha outro estado ou recarregue as cidades.')
      return
    }
    const combo = combos[Math.floor(Math.random() * combos.length)]
    const key = [combo.niche, combo.city, combo.state].map(normalize).join('|')
    setMapsNiche(combo.niche)
    setMapsCity(combo.city)
    setMapsState(combo.state)
    setUsedSearchCombos((current) => current.includes(key) ? current : [...current, key])
    setMapsError('')
    setMapsMessage('Combinação inédita selecionada e salva neste navegador.')
  }
  const clearFilters = () => { setSearch(''); setNicheFilter('Todos'); setStatusFilter('Todos') }
  const searchGoogleMaps = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!mapsNiche.trim() || !mapsCity.trim() || !mapsState.trim()) {
      setMapsError('Preencha o nicho, a cidade e o estado.')
      setMapsMessage('')
      return
    }
    setMapsLoading(true)
    setMapsError('')
    setMapsMessage('')
    try {
      const response = await fetch('/api/hasdata/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: mapsNiche.trim(), city: mapsCity.trim(), state: mapsState.trim() }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Não foi possível pesquisar no Google Maps.')
      const results = Array.isArray(payload.results) ? payload.results : []
      const imported: Lead[] = results.filter((place: { name?: string; phone?: string; website?: string }) => Boolean(place.name?.trim()) && Boolean(place.phone?.trim()) && !place.website?.trim()).map((place: { name: string; phone?: string; address?: string; website?: string; type?: string; rating?: number | string; reviews?: number | string; placeId?: string }) => ({
        id: crypto.randomUUID(),
        name: place.name.trim(),
        niche: place.type || mapsNiche.trim(),
        city: mapsCity.trim(),
        state: mapsState.trim().toUpperCase(),
        country: 'Brasil',
        status: 'A contactar' as LeadStatus,
        whatsapp: normalizePhone(place.phone || ''),
        notes: [
          place.address ? `Endereço: ${place.address}` : '',
          place.website ? `Site: ${place.website}` : '',
          place.rating !== undefined ? `Avaliação Google: ${place.rating}${place.reviews !== undefined ? ` (${place.reviews} avaliações)` : ''}` : '',
          place.placeId ? `Google Maps ID: ${place.placeId}` : '',
        ].filter(Boolean).join(' · '),
      }))
      const existingKeys = new Set(leads.map(leadKey))
      let excludedKeys: string[] = []
      try { excludedKeys = JSON.parse(window.localStorage.getItem('prospecmap-excluded-leads') || '[]') as string[] } catch {}
      const excluded = new Set(excludedKeys)
      const uniqueImported = imported.filter((lead, index) => {
        const key = leadKey(lead)
        if (existingKeys.has(key) || excluded.has(key)) return false
        existingKeys.add(key)
        return imported.findIndex((item) => leadKey(item) === key) === index
      })
      setLeads((current) => [...uniqueImported, ...current])
      setMapsMessage(uniqueImported.length
        ? `${uniqueImported.length} empresa(s) nova(s) importada(s) para sua carteira.${imported.length > uniqueImported.length ? ` ${imported.length - uniqueImported.length} repetida(s) ou já excluída(s) ignorada(s).` : ''}`
        : `Não há mais empresas novas disponíveis para “${mapsNiche.trim()}” em ${mapsCity.trim()}, ${mapsState.trim().toUpperCase()} nos resultados encontrados. As empresas já cadastradas ou excluídas foram ignoradas.`)
    } catch (error) {
      setMapsError(error instanceof Error ? error.message : 'Erro inesperado na pesquisa.')
    } finally {
      setMapsLoading(false)
    }
  }

  if (demoLead) return <EditorialDemoPage lead={demoLead} onBack={() => setDemoLead(null)} />
  return <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f6f8] text-slate-950">
    <header className="relative overflow-hidden bg-[#14283d] text-white"><div className="mx-auto max-w-6xl px-4 pb-7 pt-5 sm:px-6 lg:px-8"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-2xl bg-[#c6a96b] text-[#142033]"><Sparkles className="size-5" /></div><div><p className="text-lg font-bold tracking-tight">ProspecMap</p><p className="text-xs text-slate-300">Prospecção de plaquinhas virtuais</p><p className="text-xs text-slate-300">{leads.length} leads na carteira</p></div></div><button onClick={openNew} className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#071b3a] hover:bg-slate-100" type="button"><CirclePlus className="size-4" /><span>Novo lead</span></button></div><div className="mt-7"><p className="text-sm font-medium text-[#d9c28f]">Painel de prospecção</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Encontre sua próxima oportunidade.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Encontre empresas, confira o contato e prepare uma mensagem personalizada para apresentar sua plaquinha virtual.</p></div><div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-200"><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">1. Busque empresas</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">2. Confira o WhatsApp</span><span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">3. Gere sua abordagem</span></div></div></header>
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total de leads</span><Building2 className="size-4 text-[#347d79]" /></div><p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{leads.length}</p><p className="mt-1 text-xs text-slate-500">Empresas na carteira</p></div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">A contactar</span><MessageCircle className="size-4 text-[#9a7b3f]" /></div><p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{leads.filter((lead) => lead.status === 'A contactar').length}</p><p className="mt-1 text-xs text-slate-500/80">Próximas oportunidades</p></div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Em negociação</span><Sparkles className="size-4 text-[#347d79]" /></div><p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{leads.filter((lead) => lead.status === 'Em negociação').length}</p><p className="mt-1 text-xs text-slate-500/80">Conversas em andamento</p></div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">WhatsApp conferido</span><Check className="size-4 text-[#347d79]" /></div><p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{leads.filter((lead) => lead.whatsappCheck === 'Confirmado no WhatsApp').length}</p><p className="mt-1 text-xs text-slate-500/80">Confirmados manualmente</p></div>
      </div>
    </section>
    
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <form onSubmit={searchGoogleMaps} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#347d79]"><MapPinned className="size-5" /></div>
          <div><h2 className="font-bold text-slate-900">Buscar empresas no Google Maps</h2><p className="mt-1 text-sm leading-5 text-slate-500">Selecione o nicho, o estado e depois a cidade. Empresas sem site serão adicionadas à carteira; duplicadas são ignoradas.</p></div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>Nicho / tipo de empresa</span><select required value={mapsNiche} onChange={(e) => setMapsNiche(e.target.value)} className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-[#347d79]"><option value="">Selecione o nicho</option>{businessNiches.map((group) => <optgroup key={group.group} label={group.group}>{group.items.map((niche) => <option key={niche} value={niche}>{niche}</option>)}</optgroup>)}</select></label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>Cidade</span><select required value={mapsCity} onChange={(e) => setMapsCity(e.target.value)} disabled={!mapsState || citiesLoading || mapsCities.length === 0} className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-[#347d79] disabled:bg-slate-100"><option value="">{!mapsState ? 'Selecione primeiro o estado' : citiesLoading ? 'Carregando cidades...' : 'Selecione a cidade'}</option>{mapsCities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
          <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>Estado</span><select required value={mapsState} onChange={(e) => setMapsState(e.target.value)} className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-[#347d79]"><option value="">Selecione o estado</option>{brazilStates.map((state) => <option key={state.uf} value={state.uf}>{state.name} ({state.uf})</option>)}</select></label>
        </div>
        <button type="button" onClick={generateUniqueSearchCombo} disabled={citiesLoading || !mapsState || mapsCities.length === 0} className="mt-4 mr-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#176b57] bg-white px-4 text-sm font-bold text-[#176b57] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">Gerar nicho, cidade e estado automaticamente (não repetir)</button>
        <button type="submit" disabled={mapsLoading} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#176b57] px-4 text-sm font-bold text-white hover:bg-[#125642] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
          {mapsLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}{mapsLoading ? 'Pesquisando empresas...' : 'Pesquisar e importar empresas'}
        </button>
        {mapsError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{mapsError}</p>}
        {mapsMessage && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-slate-500">{mapsMessage}</p>}
      </form>
    </section>
    <section className="mx-auto mt-5 max-w-6xl px-4 sm:px-6 lg:px-8"><div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-[#347d79]"><Search className="size-5 text-slate-400" /><span className="sr-only">Buscar leads</span><input value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Buscar por empresa, cidade ou nicho..." />{search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca"><X className="size-4 text-slate-400" /></button>}</label><div className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Filter className="size-3.5" /> Filtros rápidos</div><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"><FilterSelect label="Nicho" value={nicheFilter} options={['Todos', ...niches]} onChange={setNicheFilter} /><FilterSelect label="Status" value={statusFilter} options={['Todos', ...statuses]} onChange={setStatusFilter} /><button type="button" onClick={clearFilters} className="h-10 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">Limpar filtros</button></div></div></section>
    <section className="mx-auto w-full min-w-0 max-w-6xl px-3 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-8"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#347d79]">Sua carteira</p><h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Empresas para abordar</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">{filteredLeads.length} encontradas</span></div>{filteredLeads.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><Building2 className="mx-auto size-9 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Nenhum lead encontrado</p><p className="mt-1 text-sm text-slate-500">Ajuste os filtros ou adicione uma nova empresa.</p></div> : <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">{filteredLeads.map((lead) => <div key={lead.id} className="space-y-3"><LeadCard lead={lead} onEdit={() => openEdit(lead)} onDelete={() => removeLead(lead.id)} onWhatsappSend={() => sendLeadToWhatsapp(lead.id)} onStatusChange={(status) => setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item))} onWhatsappCheckChange={(whatsappCheck) => setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, whatsappCheck } : item))} /></div>)}</div>}</section>
    <section className="mx-auto w-full max-w-6xl px-3 pb-10 sm:px-6 lg:px-8"><div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#347d79]">Registro de exclusões</p><h2 className="mt-1 text-lg font-bold text-slate-950">Histórico de empresas apagadas</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{deletedCompanyHistory.length}</span></div>{deletedCompanyHistory.length === 0 ? <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">As empresas apagadas aparecerão aqui com os dados disponíveis.</p> : <ul className="max-h-64 space-y-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]">{deletedCompanyHistory.map((entry, index) => { const company = typeof entry === "string" ? { name: entry, city: "Não informado", state: "", country: "Não informado", niche: "Não informado", cep: "Não informado" } : entry; return <li key={index} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm text-slate-700"><p className="font-bold text-slate-900">{company.name}</p><p className="mt-1 font-medium">Cidade: {company.city}{company.state ? `, ${company.state}` : ""} · País: {company.country}</p><p className="mt-1 font-medium">Nicho: {company.niche} · CEP: {company.cep}</p><button type="button" onClick={() => { const mapsUrl = "mapsUrl" in company ? company.mapsUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.name} ${company.city} ${company.state}`)}`; navigator.clipboard.writeText(mapsUrl).then(() => window.alert("Link do Google Maps copiado!")).catch(() => window.prompt("Copie o link do Google Maps:", mapsUrl)) }} className="mt-2 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#347d79] hover:bg-slate-50">Copiar link do Google Maps</button></li> })}</ul>}</div></section>
    {isFormOpen && <LeadForm lead={editingLead} onClose={() => setIsFormOpen(false)} onSubmit={saveLead} />}
  </main>
}


function SiteAdmin({ lead, sites, onCreate, onManage, busy, adminToken }: { lead: Lead; sites: SiteRecord[]; onCreate: () => void; onManage: (site: SiteRecord, action: 'confirm_payment' | 'publish' | 'unpublish') => void; busy: string | null; adminToken: string }) {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://mapsgoogle-three.vercel.app'
  return <section className="rounded-2xl border border-[#d8e2e5] bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#347d79]">Prévia e publicação</p><p className="mt-1 text-sm text-slate-600">Crie um link exclusivo para {lead.name} e envie ao cliente.</p></div><button type="button" disabled={Boolean(busy)} onClick={onCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#172b42] px-4 text-sm font-bold text-white disabled:opacity-50"><ExternalLink className="size-4" />{busy === lead.id ? 'Aguarde...' : 'Gerar link de prévia'}</button></div>{sites.map((site) => { const link = base + '/site/' + site.slug; return <div key={site.id} className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"><a href={link} target="_blank" rel="noreferrer" className="break-all text-sm font-bold text-[#17665a] underline underline-offset-2">{link}</a><div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold"><span className={site.payment_status === 'paid' ? 'rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800' : 'rounded-full bg-amber-100 px-2.5 py-1 text-amber-900'}>{site.payment_status === 'paid' ? 'Pix confirmado' : 'Aguardando Pix'}</span><span className={site.site_status === 'published' ? 'rounded-full bg-blue-100 px-2.5 py-1 text-blue-800' : 'rounded-full bg-slate-200 px-2.5 py-1 text-slate-700'}>{site.site_status === 'published' ? 'Publicado' : 'Somente prévia'}</span></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => navigator.clipboard.writeText(link)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">Copiar link</button>{site.payment_status !== 'paid' && <button type="button" disabled={Boolean(busy)} onClick={() => onManage(site, 'confirm_payment')} className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-800 disabled:opacity-50">Confirmar Pix recebido</button>}{site.payment_status === 'paid' && site.site_status !== 'published' && <button type="button" disabled={Boolean(busy)} onClick={() => onManage(site, 'publish')} className="rounded-lg bg-[#166b53] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Publicar site</button>}{site.site_status === 'published' && <button type="button" disabled={Boolean(busy)} onClick={() => onManage(site, 'unpublish')} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50">Retirar do ar</button>}</div><SitePhotoManager siteId={site.id} token={adminToken} initialPhotos={site.site_data.photos || []} initialLogo={site.site_data.logoUrl || ''} /></div> })}</section>
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="relative"><span className="sr-only">Filtrar por {label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-xs font-semibold text-slate-600 outline-none"><option value={options[0]}>{label}: {options[0]}</option>{options.slice(1).map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-3 size-3.5 text-slate-400" /></label> }
function LeadForm({ lead, onClose, onSubmit }: { lead: Lead | null; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#172b42]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><form onSubmit={onSubmit} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7" aria-label="Formulário de lead"><div className="mb-6 flex items-start justify-between"><div><p className="text-sm font-bold text-[#347d79]">{lead ? 'Editar cadastro' : 'Novo cadastro'}</p><h2 className="mt-1 text-2xl font-bold tracking-tight">{lead ? 'Atualizar lead' : 'Adicionar novo lead'}</h2></div><button type="button" onClick={onClose} aria-label="Fechar formulário" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nome da empresa" name="name" placeholder="Ex: Café Central" defaultValue={lead?.name} required /><Field label="Nicho" name="niche" placeholder="Ex: Pizzaria" defaultValue={lead?.niche} required /><Field label="Cidade" name="city" placeholder="Ex: São Paulo" defaultValue={lead?.city} required /><Field label="Estado" name="state" placeholder="Ex: SP" defaultValue={lead?.state} maxLength={2} required /><Field label="País" name="country" placeholder="Brasil" defaultValue={lead?.country || 'Brasil'} required /><Field label="WhatsApp com DDD" name="whatsapp" placeholder="Ex: (11) 99999-9999" defaultValue={lead?.whatsapp} inputMode="tel" required /><label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">Status<select name="status" defaultValue={lead?.status || 'A contactar'} className="h-11 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none"><option>A contactar</option>{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label><label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">Notas / observações<textarea name="notes" defaultValue={lead?.notes} placeholder="Anote o que percebeu no Google Maps..." rows={3} className="resize-none rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none" /></label></div><button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#172b42] font-bold text-white hover:bg-[#23445a]"><Check className="size-5" />{lead ? 'Salvar alterações' : 'Salvar lead'}</button></form></div> }
function Field({ label, name, placeholder, required, defaultValue, maxLength, inputMode }: { label: string; name: string; placeholder: string; required?: boolean; defaultValue?: string; maxLength?: number; inputMode?: 'tel' }) { return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}</span><input name={name} placeholder={placeholder} defaultValue={defaultValue} required={required} maxLength={maxLength} inputMode={inputMode} className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none placeholder:text-slate-400" /></label> }
function LeadCard({ lead, onEdit, onDelete, onWhatsappSend, onStatusChange, onWhatsappCheckChange }: { lead: Lead; onEdit: () => void; onDelete: () => void; onWhatsappSend: () => void; onStatusChange: (status: LeadStatus) => void; onWhatsappCheckChange: (status: WhatsappCheck) => void }) { const phone = normalizePhone(lead.whatsapp); const whatsappTestUrl = `https://wa.me/${phone}`; const [plaquinhaMessage, setPlaquinhaMessage] = useState(''); const generatePlaquinhaMessage = () => { const approaches = [
`Olá, ${lead.name}, tudo bem? Meu nome é Fabrício. Gostaria de apresentar uma solução prática para o atendimento da sua empresa: as plaquinhas virtuais, que reúnem acessos como Pix, avaliação no Google, Wi-Fi, Instagram e WhatsApp por meio de QR Code.\n\nCada plaquinha custa R$ 30, e você pode adquirir somente as que precisa. O pacote completo com as 5 plaquinhas sai normalmente por R$ 150, mas hoje está em promoção por R$ 100. Não há mensalidade.\n\nSe desejar, posso enviar uma demonstração para você conhecer melhor.`,
`Olá, equipe da ${lead.name}! Aqui é o Fabrício. Estou entrando em contato para apresentar as nossas plaquinhas virtuais personalizadas, que facilitam o acesso dos clientes ao Pix, à avaliação no Google, ao Wi-Fi, ao Instagram e ao WhatsApp em um só lugar.\n\nO valor individual é de R$ 30 por plaquinha. Para quem deseja o conjunto completo com 5 unidades, o preço normal de R$ 150 está com uma condição promocional hoje: R$ 100 pelo pacote. Sem mensalidade.\n\nPosso compartilhar um exemplo de como funciona?`,
`Olá! Tudo bem? Sou o Fabrício e gostaria de mostrar uma opção interessante para a ${lead.name}. Com as plaquinhas virtuais, seus clientes acessam recursos como Pix, avaliação no Google, Wi-Fi, Instagram e WhatsApp escaneando um QR Code.\n\nVocê pode escolher cada plaquinha por R$ 30 ou aproveitar a promoção de hoje: o conjunto completo com 5 plaquinhas, que custa R$ 150 normalmente, sai por R$ 100. A solução não tem mensalidade.\n\nGostaria de receber uma demonstração?`,
`Olá, ${lead.name}, tudo bem? Meu nome é Fabrício. Trabalho com plaquinhas virtuais para tornar o atendimento mais simples e organizado. Elas podem reunir Pix, avaliação do Google, Wi-Fi, Instagram e WhatsApp em uma página acessada por QR Code.\n\nCada plaquinha custa R$ 30. O pacote completo com 5 plaquinhas custa normalmente R$ 150, mas hoje está por R$ 100. Se preferir, também é possível comprar unidades separadas. Não existe mensalidade.\n\nPosso te enviar uma prévia para avaliar?`,
`Olá, pessoal da ${lead.name}! Sou o Fabrício. Estou apresentando uma solução digital que ajuda a deixar as principais opções da empresa disponíveis em um único QR Code: Pix, avaliação no Google, Wi-Fi, Instagram e WhatsApp.\n\nAs plaquinhas podem ser adquiridas individualmente por R$ 30 cada. Para o conjunto completo de 5, o valor seria R$ 150, mas a promoção de hoje fica em R$ 100. Sem cobrança mensal.\n\nSe fizer sentido para vocês, posso enviar uma demonstração sem compromisso.`,
`Olá, tudo bem? Aqui é o Fabrício. Gostaria de apresentar as plaquinhas virtuais personalizadas para a ${lead.name}. A ideia é facilitar a experiência do cliente reunindo em uma página acessos úteis por QR Code, como Pix, avaliação no Google, Wi-Fi, Instagram e WhatsApp.\n\nO preço é de R$ 30 por plaquinha avulsa. Já o conjunto completo com 5 plaquinhas sai normalmente por R$ 150 e, na promoção de hoje, por R$ 100. Você escolhe a opção que melhor atende à empresa, sem mensalidade.\n\nQuer que eu envie um exemplo?`
]; const available = approaches.filter((message) => message !== plaquinhaMessage); setPlaquinhaMessage(available[Math.floor(Math.random() * available.length)] || approaches[0]); }; const plaquinhaUrl = `https://wa.me/${phone}?text=${encodeURIComponent(plaquinhaMessage)}`; const whatsappCheck = lead.whatsappCheck || 'Não verificado'; const checkStyle = whatsappCheck === 'Confirmado no WhatsApp' ? 'bg-emerald-50 text-[#347d79] ring-emerald-200' : whatsappCheck === 'Não encontrado no WhatsApp' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-amber-50 text-[#9a7b3f] ring-amber-200'; return <article className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition duration-200 hover:border-[#b9d5d1] hover:shadow-lg hover:shadow-slate-900/[0.06] sm:p-5"><div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3"><div className="flex min-w-0 items-start gap-2 sm:gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1357a6]"><Building2 className="size-5" /></div><div className="min-w-0"><h3 className="break-words font-bold leading-5 text-slate-900">{lead.name}</h3><p className="mt-0.5 text-sm text-slate-500">{lead.niche}</p></div></div><span className={`max-w-[45%] shrink-0 whitespace-normal rounded-full px-2 py-1 text-center text-[10px] font-bold leading-4 ring-1 sm:px-2.5 sm:text-[11px] ${statusStyles[lead.status]}`}>{lead.status}</span></div><div className="mt-4 flex min-w-0 items-start gap-2 text-sm text-slate-600"><MapPin className="mt-0.5 size-4 shrink-0 text-[#347d79]" /><span className="min-w-0 break-words [overflow-wrap:anywhere]">{lead.city}, {lead.state} · {lead.country}</span></div>{lead.notes && <div className="mt-3 flex gap-2 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-600"><StickyNote className="mt-0.5 size-4 shrink-0 text-slate-400" /><p className="min-w-0 break-words [overflow-wrap:anywhere]">{lead.notes}</p></div>}<div className="mt-4"><span className={`inline-flex max-w-full whitespace-normal break-words rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${checkStyle}`}>WhatsApp: {whatsappCheck}</span></div><div className="mt-3 grid min-w-0 grid-cols-1 gap-2"><a href={whatsappTestUrl} target="_blank" rel="noreferrer" className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Search className="size-4" />Conferir número no WhatsApp</a><div className="grid gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3"><div><p className="text-sm font-bold text-emerald-950">Venda de plaquinha virtual</p><p className="mt-1 text-xs leading-5 text-emerald-900">Gere uma mensagem personalizada e revise antes de enviar.</p></div><button type="button" onClick={generatePlaquinhaMessage} className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-[#087653] px-3 text-sm font-bold text-white hover:bg-[#066344]"><Sparkles className="size-4" />Gerar mensagem</button>{plaquinhaMessage && <><label className="grid gap-1.5 text-xs font-bold text-emerald-950">Mensagem gerada<textarea readOnly value={plaquinhaMessage} rows={7} className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-slate-800" /></label><a href={plaquinhaUrl} target="_blank" rel="noreferrer" onClick={onWhatsappSend} className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-[#075e54] px-2 text-xs font-bold text-white hover:bg-[#064e46] sm:px-3 sm:text-sm"><MessageCircle className="size-4" />Enviar pelo WhatsApp</a></>}</div></div><details className="mt-3 rounded-xl border border-slate-200"><summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-slate-600">Verificação do WhatsApp</summary><div className="p-3 pt-0"><p className="mb-3 text-xs leading-5 text-slate-500">Confira o número no WhatsApp e registre o resultado manualmente.</p><div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => onWhatsappCheckChange('Confirmado no WhatsApp')} className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#347d79] hover:bg-emerald-50">Confirmar que tem WhatsApp</button><button type="button" onClick={() => onWhatsappCheckChange('Não encontrado no WhatsApp')} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50">Marcar como não encontrado</button></div><button type="button" onClick={() => onWhatsappCheckChange('Não verificado')} className="mt-2 text-xs font-semibold text-slate-500 underline underline-offset-2">Limpar resultado</button></div></details><div className="mt-3 flex min-w-0 items-center justify-between gap-2"><label className="relative min-w-0 flex-1"><span className="sr-only">Alterar status de {lead.name}</span><select value={lead.status} onChange={(e) => onStatusChange(e.target.value as LeadStatus)} className="h-10 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 sm:px-3"><option disabled>Alterar status</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-slate-500" /></label><button type="button" onClick={onEdit} aria-label={`Editar ${lead.name}`} className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"><Pencil className="size-4" /></button><button type="button" onClick={onDelete} aria-label={`Excluir ${lead.name}`} className="rounded-xl border border-red-100 p-2.5 text-red-500 hover:bg-red-50"><Trash2 className="size-4" /></button></div></article> }

function EditorialDemoPage({ lead, onBack }: { lead: Lead; onBack: () => void }) {
  const phone = normalizePhone(lead.whatsapp)
  const wa = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Olá! Vi o site de ${lead.name} e gostaria de saber mais.`)}` : '#contato'
  const isFood = /pizza|restaurante|lanch|caf[eé]|padaria|hamburg|confeit|açai|açaí|delivery|comida/i.test(lead.niche)
  const isBeauty = /sal[aã]o|beleza|barbe|est[eé]tica|unha|cabelo|spa/i.test(lead.niche)
  const isAuto = /oficina|mec[aâ]n|auto|carro|pneu|funilaria|mot[oó]/i.test(lead.niche)
  const images = isFood ? ["https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1800&q=90", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=1000&q=85"] : isBeauty ? ["https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=90", "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1000&q=85"] : isAuto ? ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1800&q=90", "https://images.unsplash.com/photo-1632823471565-1ecdf5c6f4f7?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1000&q=85"] : ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=90", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85", "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85"]
  const copy = isFood ? { eyebrow: 'Da cozinha para a sua mesa', hero: 'Sabor que fica na memória', intro: 'Tudo preparado com cuidado, no ritmo da sua cidade.', accent: '#d46b35' } : isBeauty ? { eyebrow: 'Seu tempo, seu estilo', hero: 'Um cuidado feito para você', intro: 'Um espaço para desacelerar, escolher e sair se sentindo bem.', accent: '#c995a8' } : isAuto ? { eyebrow: 'Confiança em cada detalhe', hero: 'Seu carro em boas mãos', intro: 'Diagnóstico claro, serviço cuidadoso e agilidade para você seguir.', accent: '#6f9eb7' } : { eyebrow: 'Feito para a sua rotina', hero: 'Uma boa escolha começa aqui', intro: 'Atendimento próximo, experiência e atenção em cada detalhe.', accent: '#c3a36b' }
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const faq = ['Preciso agendar antes de ir?', 'Quais serviços estão disponíveis?', 'Quanto tempo leva o atendimento?', 'Como consultar valores?']
  const services = ['Atendimento personalizado', 'Qualidade em cada detalhe', 'Conversa direta pelo WhatsApp']
  return <main className="editorial-demo min-h-screen overflow-x-hidden bg-[#0d0a08] text-[#eee5d9]">
    <header className="sticky top-0 z-50 border-b border-[#d5c2aa]/15 bg-[#0d0a08]/95 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8"><button type="button" onClick={onBack} className="text-left text-xs font-bold uppercase tracking-[0.18em] text-[#c8baa9] transition hover:text-white">← Voltar para o painel</button><div className="hidden text-center sm:block"><p className="font-serif text-lg">{lead.name}</p><p className="text-[9px] uppercase tracking-[0.3em] text-[#aa9b89]">{lead.niche} · {lead.city}, {lead.state}</p></div><a href={wa} target="_blank" rel="noreferrer" className="rounded-sm bg-[#d6d3cf] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#17120f]">Agendar</a></div></header>
    <section id="inicio" className="relative isolate min-h-[720px] overflow-hidden"><img src={images[0]} alt="Imagem de destaque de {lead.name}" className="absolute inset-0 h-full w-full object-cover opacity-45" /><div className="absolute inset-0 bg-gradient-to-b from-[#0d0a08]/75 via-[#0d0a08]/35 to-[#0d0a08]" /><div className="relative mx-auto flex min-h-[720px] max-w-6xl flex-col justify-end px-5 pb-16 pt-24 sm:px-10 sm:pb-24"><div className="max-w-3xl"><p className="mb-7 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.32em] text-[#b4a28e]"><span className="h-px w-10 bg-[#b4a28e]" />{copy.eyebrow}</p><h1 className="font-serif text-5xl leading-[.95] tracking-[-.045em] sm:text-7xl lg:text-8xl">{copy.hero}<span className="mt-3 block text-[#d6c7b7]">{lead.name}</span></h1><p className="mt-8 max-w-xl text-base leading-7 text-[#c6b8a7] sm:text-lg">{copy.intro} {lead.city}, {lead.state}.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href={wa} target="_blank" rel="noreferrer" className="bg-[#d6d3cf] px-7 py-4 text-center text-xs font-black uppercase tracking-[0.2em] text-[#17120f] shadow-[0_0_35px_rgba(214,211,207,.2)]">Chamar no WhatsApp →</a><a href="#servicos" className="border border-[#d7c8b8]/45 px-7 py-4 text-center text-xs font-black uppercase tracking-[0.2em] text-[#eee5d9]">Ver serviços</a></div></div></div></section>
    <section className="border-y border-[#d5c2aa]/15 bg-[#17110d]"><div className="mx-auto grid max-w-6xl sm:grid-cols-3">{[['+2.000','atendimentos realizados'],['4,8','nota média'],['+12','serviços oferecidos']].map(([value,label]) => <div key={label} className="border-b border-[#d5c2aa]/15 px-6 py-9 last:border-0 sm:border-b-0 sm:border-r sm:px-10"><p className="font-serif text-5xl text-[#d4c3b0]">{value}</p><p className="mt-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#a8947f]">{label}</p></div>)}</div></section>
    <section id="servicos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-10"><p className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#a8947f]"><span className="h-px w-10 bg-[#a8947f]" />01 · por que aqui</p><h2 className="mt-7 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Uma experiência pensada para {lead.city}</h2><p className="mt-6 max-w-2xl text-[#b9aa99]">Tudo começa com uma conversa simples. Conheça o jeito {lead.name} de atender.</p><div className="mt-14 grid gap-4 md:grid-cols-3">{services.map((service, index) => <article key={service} className="border border-[#d5c2aa]/20 bg-[#15100c] p-7"><span className="font-serif text-4xl text-[#665545]">0{index + 1}</span><h3 className="mt-10 text-lg font-bold">{service}</h3><p className="mt-3 text-sm leading-6 text-[#a99784]">Cuidado, clareza e uma equipe pronta para receber você.</p></article>)}</div></section>
    <section id="sobre" className="border-y border-[#d5c2aa]/15 bg-[#17110d] px-5 py-24 sm:px-10"><div className="mx-auto max-w-6xl"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a8947f]">02 · o espaço</p><h2 className="mt-6 max-w-3xl font-serif text-4xl sm:text-6xl">Feito por quem gosta de fazer bem feito</h2><p className="mt-6 max-w-2xl leading-7 text-[#b9aa99]">Uma casa local, construída com atenção ao que realmente importa: bons resultados, conversa honesta e uma experiência que dá vontade de repetir.</p><div className="mt-12 grid grid-cols-2 gap-2"><img src={images[1]} alt="Ambiente de {lead.name}" className="h-64 w-full object-cover sm:h-96" /><img src={images[2]} alt="Detalhe do trabalho de {lead.name}" className="h-64 w-full object-cover sm:h-96" /></div></div></section>
    <section id="duvidas" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-10"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a8947f]">03 · perguntas frequentes</p><h2 className="mt-6 font-serif text-4xl sm:text-6xl">Antes de vir, as respostas</h2><div className="mt-10 border-t border-[#d5c2aa]/20">{faq.map((question,index) => <div key={question} className="border-b border-[#d5c2aa]/20"><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between py-6 text-left font-semibold"><span>{question}</span><span className="text-2xl font-light text-[#a8947f]">{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p className="pb-6 pr-8 text-sm leading-6 text-[#a99784]">Fale com a equipe de {lead.name} pelo WhatsApp para confirmar os detalhes e receber uma orientação personalizada.</p>}</div>)}</div></section>
    <section id="contato" className="bg-[#17110d] px-5 py-24 text-center sm:px-10"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a8947f]">04 · na agenda</p><h2 className="mx-auto mt-6 max-w-2xl font-serif text-4xl sm:text-6xl">Está na hora de dar um trato?</h2><p className="mx-auto mt-6 max-w-xl text-[#b9aa99]">Mande uma mensagem com o que você precisa e combine o melhor momento.</p><a href={wa} target="_blank" rel="noreferrer" className="mt-10 inline-flex bg-[#d6d3cf] px-8 py-5 text-xs font-black uppercase tracking-[0.2em] text-[#17120f]">Chamar no WhatsApp</a></section>
    <footer className="border-t border-[#d5c2aa]/15 px-5 py-12 sm:px-10"><div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-serif text-2xl">{lead.name}</p><p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#a8947f]">{lead.niche} · {lead.city}, {lead.state}</p></div><p className="text-xs text-[#8e7d6d]">© 2026 · Imagens ilustrativas</p></div></footer>
    {phone && <a href={wa} target="_blank" rel="noreferrer" aria-label="Chamar no WhatsApp" className="fixed bottom-6 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#d6d3cf] text-xl text-[#17120f] shadow-2xl transition hover:scale-105">◉</a>}
  </main>
}

function DemoPage({ lead, onBack }: { lead: Lead; onBack: () => void }) {
  const phone = normalizePhone(lead.whatsapp)
  const isFood = /pizza|restaurante|lanch|caf[eé]|padaria|hamburg|confeit|açai|açaí|delivery|comida/i.test(lead.niche)
  const isAuto = /oficina|mec[aâ]n|auto|carro|pneu|funilaria|mot[oó]/i.test(lead.niche)
  const isBeauty = /sal[aã]o|beleza|barbe|est[eé]tica|unha|cabelo|spa/i.test(lead.niche)
  const isHealth = /dent|cl[ií]nic|m[eé]dic|sa[uú]de|fisio|terap|psic[oó]log/i.test(lead.niche)
  const waText = "Olá! Gostaria de saber mais sobre os serviços de " + lead.name + "."
  const wa = phone ? "https://wa.me/" + phone + "?text=" + encodeURIComponent(waText) : ""
  const images = isFood
    ? [
        { src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1800&q=90", alt: "Pizza artesanal preparada na hora" },
        { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=85", alt: "Interior acolhedor de restaurante" },
        { src: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?auto=format&fit=crop&w=1100&q=85", alt: "Mesa preparada para uma refeição" },
      ]
    : isAuto
    ? [
        { src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1800&q=90", alt: "Especialista trabalhando em um veículo" },
        { src: "https://images.unsplash.com/photo-1632823471565-1ecdf5c6f4f7?auto=format&fit=crop&w=1100&q=85", alt: "Detalhes de um automóvel" },
        { src: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1100&q=85", alt: "Manutenção automotiva" },
      ]
    : isBeauty
    ? [
        { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1800&q=90", alt: "Interior elegante de salão de beleza" },
        { src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1100&q=85", alt: "Espaço profissional de beleza" },
        { src: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1100&q=85", alt: "Ambiente de cuidados pessoais" },
      ]
    : isHealth
    ? [
        { src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1800&q=90", alt: "Recepção de clínica contemporânea" },
        { src: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1100&q=85", alt: "Ambiente clínico organizado" },
        { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1100&q=85", alt: "Profissional de saúde em atendimento" },
      ]
    : [
        { src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=90", alt: "Espaço profissional contemporâneo" },
        { src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1100&q=85", alt: "Ambiente de trabalho organizado" },
        { src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1100&q=85", alt: "Espaço profissional acolhedor" },
      ]
  const theme = isFood
    ? { page: "bg-[#fbf7f0]", ink: "text-[#251914]", muted: "text-[#77665c]", accent: "text-[#a93f26]", solid: "bg-[#a93f26] hover:bg-[#87301d]", soft: "bg-[#f3e4d8]", border: "border-[#e8d7c8]", dark: "bg-[#211611]", darkText: "text-white", eyebrow: "Da nossa cozinha para a sua mesa", headline: "Feito com cuidado. Servido com carinho.", section: "Uma boa experiência começa aqui.", cta: "Vamos preparar seu próximo momento?" }
    : isAuto
    ? { page: "bg-[#f4f6f8]", ink: "text-[#122131]", muted: "text-[#607080]", accent: "text-[#167e9b]", solid: "bg-[#087e9e] hover:bg-[#06647d]", soft: "bg-[#e0f3f7]", border: "border-[#dce5eb]", dark: "bg-[#0c1a28]", darkText: "text-white", eyebrow: "Cuidado técnico em cada detalhe", headline: "Seu veículo merece atenção especializada.", section: "O cuidado certo para seguir em frente.", cta: "Vamos conversar sobre seu veículo?" }
    : isBeauty
    ? { page: "bg-[#fcf7f8]", ink: "text-[#34232e]", muted: "text-[#806b78]", accent: "text-[#a6537b]", solid: "bg-[#a6537b] hover:bg-[#874061]", soft: "bg-[#f5e5ed]", border: "border-[#ead6e0]", dark: "bg-[#2b1a26]", darkText: "text-white", eyebrow: "Seu momento de cuidado", headline: "Beleza com personalidade. Cuidado em cada detalhe.", section: "Um espaço pensado para você.", cta: "Seu próximo momento começa aqui." }
    : isHealth
    ? { page: "bg-[#f7fbfa]", ink: "text-[#163431]", muted: "text-[#627c78]", accent: "text-[#247f76]", solid: "bg-[#247f76] hover:bg-[#1b665f]", soft: "bg-[#e2f2ef]", border: "border-[#d8e9e5]", dark: "bg-[#123431]", darkText: "text-white", eyebrow: "Acolhimento e atenção", headline: "Cuidado profissional com você no centro.", section: "Informação clara para cuidar melhor.", cta: "Dê o primeiro passo com tranquilidade." }
    : { page: "bg-[#f7f8fa]", ink: "text-[#172334]", muted: "text-[#667487]", accent: "text-[#347a75]", solid: "bg-[#183d43] hover:bg-[#24545a]", soft: "bg-[#e4efee]", border: "border-[#e0e5e9]", dark: "bg-[#132632]", darkText: "text-white", eyebrow: "Atendimento próximo e profissional", headline: "Uma boa escolha começa com uma boa conversa.", section: "Conheça a empresa de perto.", cta: "Vamos conversar sobre o que você precisa?" }
  const services = isFood
    ? [{ title: "Cardápio e especialidades", desc: "Descubra as opções disponíveis e escolha o que combina com seu momento.", image: images[0] }, { title: "Pedidos e encomendas", desc: "Consulte opções, valores e formas de fazer seu pedido diretamente com a equipe.", image: images[1] }, { title: "Uma experiência especial", desc: "Tire suas dúvidas e combine os detalhes para aproveitar melhor sua visita.", image: images[2] }]
    : isAuto
    ? [{ title: "Avaliação do veículo", desc: "Conte o que está acontecendo e consulte as opções de avaliação disponíveis.", image: images[0] }, { title: "Serviços automotivos", desc: "Conheça os serviços oferecidos e confirme qual atende à necessidade do seu veículo.", image: images[1] }, { title: "Orçamento e orientação", desc: "Converse com a equipe, tire dúvidas e confirme os próximos passos antes de decidir.", image: images[2] }]
    : isBeauty
    ? [{ title: "Serviços de beleza", desc: "Conheça as opções de cuidado e encontre o atendimento que combina com seu estilo.", image: images[0] }, { title: "Agende seu momento", desc: "Consulte horários e combine sua visita com a equipe.", image: images[1] }, { title: "Cuidado personalizado", desc: "Conte o que procura para receber informações sobre as opções disponíveis.", image: images[2] }]
    : isHealth
    ? [{ title: "Conheça os atendimentos", desc: "Consulte as informações sobre os serviços e especialidades disponíveis.", image: images[0] }, { title: "Agendamento", desc: "Converse com a equipe para verificar horários e orientações para a primeira consulta.", image: images[1] }, { title: "Informação e acolhimento", desc: "Tire dúvidas sobre o atendimento e saiba como se preparar para o primeiro contato.", image: images[2] }]
    : [{ title: "Conheça os serviços", desc: "Veja as opções disponíveis e encontre a solução mais adequada à sua necessidade.", image: images[0] }, { title: "Atendimento próximo", desc: "Fale diretamente com a equipe para entender as possibilidades e esclarecer dúvidas.", image: images[1] }, { title: "Solicite informações", desc: "Consulte condições, disponibilidade e os próximos passos para contratar.", image: images[2] }]
  const faqs = [
    { q: "Quais serviços estão disponíveis?", a: "Fale com a equipe para conhecer os serviços oferecidos e confirmar qual opção atende à sua necessidade." },
    { q: "Como consultar valores e disponibilidade?", a: "Entre em contato para confirmar valores, horários e condições atualizadas antes de contratar." },
    { q: "Onde a empresa está localizada?", a: "A empresa atende em " + lead.city + ", " + lead.state + ". Entre em contato para confirmar o endereço completo e as orientações para chegar." },
    { q: "Como faço para agendar ou solicitar atendimento?", a: "Use o botão de contato nesta página para conversar diretamente com a empresa e combinar os próximos passos." },
  ]
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const navItems = [{ label: "Serviços", href: "#servicos" }, { label: "A empresa", href: "#sobre" }, { label: "Perguntas", href: "#duvidas" }]
  const heroCopy = <div className="relative z-10 max-w-2xl">
    <p className={"inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] " + (isBeauty ? "text-white/80" : isFood || isAuto ? "text-white/75" : theme.accent)}><span className={"h-px w-8 " + (isBeauty || isFood || isAuto ? "bg-current" : "bg-current")} />{theme.eyebrow}</p>
    <h1 className={"mt-6 text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl " + ((isBeauty || isFood) ? "font-serif" : "font-sans font-black")}>{lead.name}<span className={"mt-4 block " + (isBeauty || isFood || isAuto ? "text-white/80" : "text-[#6b8581]")}>{theme.headline}</span></h1>
    <p className={"mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8 " + (isFood || isAuto || isBeauty ? "text-white/78" : theme.muted)}>Conheça nosso trabalho, consulte as opções disponíveis e fale diretamente com a equipe em {lead.city}, {lead.state}.</p>
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {wa && <a href={wa} target="_blank" rel="noreferrer" className={"inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-extrabold text-white shadow-xl transition duration-300 hover:-translate-y-0.5 " + theme.solid}><MessageCircle className="size-5" />{isFood ? "Consultar cardápio e pedidos" : isBeauty ? "Agendar pelo WhatsApp" : isAuto ? "Solicitar orçamento" : isHealth ? "Consultar atendimento" : "Falar com a equipe"}<ArrowRight className="size-4" /></a>}
      <a href="#servicos" className={"inline-flex min-h-14 items-center justify-center gap-2 rounded-full border px-6 py-4 text-sm font-bold transition hover:bg-black/5 " + (isFood || isAuto || isBeauty ? "border-white/35 text-white hover:bg-white/10" : "border-slate-300 text-slate-700")}>Conhecer os serviços<ArrowRight className="size-4" /></a>
    </div>
    <div className={"mt-8 flex items-center gap-3 text-sm " + (isFood || isAuto || isBeauty ? "text-white/70" : theme.muted)}><MapPin className="size-4 shrink-0" /><span>{lead.city}, {lead.state}, Brasil</span><span className="mx-1 h-1 w-1 rounded-full bg-current opacity-50" /><span>Atendimento direto</span></div>
  </div>
  return <main className={theme.page + " min-h-screen overflow-hidden " + theme.ink}>
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-7 lg:px-10">
        <a href="#inicio" onClick={() => setMenuOpen(false)} className="flex min-w-0 items-center gap-3">
          <span className={"flex size-11 shrink-0 items-center justify-center rounded-xl text-white " + theme.dark}><Building2 className="size-5" /></span>
          <span className="min-w-0"><span className="block max-w-[58vw] truncate text-base font-extrabold tracking-tight sm:max-w-none sm:text-lg">{lead.name}</span><span className={"block truncate text-[10px] font-bold uppercase tracking-[0.13em] " + theme.muted}>{lead.niche} · {lead.city}</span></span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex" aria-label="Navegação principal">{navItems.map((item) => <a key={item.href} href={item.href} className="transition hover:text-slate-950">{item.label}</a>)}</nav>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 md:hidden">{menuOpen ? "Fechar" : "Menu"}</button>
          {wa ? <a href={wa} target="_blank" rel="noreferrer" className={"inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold text-white transition hover:brightness-110 " + theme.solid}><MessageCircle className="size-4" /><span className="hidden sm:inline">Entre em contato</span><span className="sm:hidden">Contato</span></a> : <a href="#contato" className={"rounded-full px-4 py-2.5 text-sm font-bold text-white " + theme.solid}>Contato</a>}
        </div>
      </div>
      {menuOpen && <nav className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700 md:hidden">{[...navItems, { label: "Contato", href: "#contato" }].map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-xl bg-slate-50 px-4 py-3">{item.label}</a>)}</nav>}
    </header>
    {isFood ? <section id="inicio" className={"relative isolate overflow-hidden " + theme.dark + " text-white"}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(169,63,38,.32),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_.95fr] lg:gap-14 lg:px-10 lg:py-24">
        {heroCopy}
        <div className="relative min-h-[360px] sm:min-h-[510px]"><div className="absolute inset-4 rotate-3 rounded-[2rem] border border-white/10" /><img src={images[0].src} alt={images[0].alt} className="absolute inset-0 h-full w-full rounded-[1.75rem] object-cover shadow-2xl" fetchPriority="high" /><div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-t from-[#1b100c]/75 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-[#211611]/70 p-5 backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-7"><p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/65">Uma experiência para saborear</p><p className="mt-2 text-xl font-semibold sm:text-2xl">{lead.name}</p><p className="mt-1 text-sm text-white/70">{lead.city}, {lead.state}</p></div></div>
      </div>
    </section> : isBeauty ? <section id="inicio" className="relative isolate min-h-[650px] overflow-hidden bg-[#281a25] text-white sm:min-h-[740px]">
      <img src={images[0].src} alt={images[0].alt} className="absolute inset-0 h-full w-full object-cover object-center" fetchPriority="high" /><div className="absolute inset-0 bg-gradient-to-r from-[#21151f]/95 via-[#21151f]/75 to-[#21151f]/15" /><div className="absolute inset-0 bg-gradient-to-t from-[#21151f]/60 via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-5 py-16 sm:min-h-[740px] sm:px-8 lg:px-10">{heroCopy}<div className="absolute bottom-7 right-7 hidden max-w-xs border-l border-white/50 pl-5 text-sm leading-6 text-white/75 lg:block">Seu tempo. Seu estilo. Um atendimento pensado para você.</div></div>
    </section> : isAuto ? <section id="inicio" className="relative isolate min-h-[650px] overflow-hidden bg-[#0c1a28] text-white sm:min-h-[720px]">
      <img src={images[0].src} alt={images[0].alt} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" /><div className="absolute inset-0 bg-gradient-to-r from-[#071521]/95 via-[#0c1a28]/80 to-[#0c1a28]/25" /><div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0c1a28] to-transparent" />
      <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-5 py-16 sm:min-h-[720px] sm:px-8 lg:px-10">{heroCopy}</div>
      <div className="relative mx-auto grid max-w-7xl gap-3 px-5 pb-8 sm:grid-cols-3 sm:px-8 lg:px-10">{["Avaliação e orientação", "Serviços sob consulta", "Orçamento direto"].map((item, i) => <div key={item} className="flex items-center gap-3 border-t border-white/20 py-4 text-sm font-semibold text-white/85"><span className="text-xs font-black text-cyan-300">{"0" + (i + 1)}</span>{item}</div>)}</div>
    </section> : <section id="inicio" className="relative overflow-hidden">
      <div className="absolute right-[-10%] top-[-15%] h-[34rem] w-[34rem] rounded-full bg-current opacity-[0.035] blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1fr_.9fr] lg:gap-16 lg:px-10 lg:py-24">
        {heroCopy}
        <div className="relative min-h-[340px] overflow-hidden rounded-[1.75rem] sm:min-h-[500px]"><img src={images[0].src} alt={images[0].alt} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/15 p-5 text-white backdrop-blur-md sm:bottom-7 sm:left-7 sm:right-7"><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70">Conheça a empresa</p><p className="mt-2 text-xl font-bold">{lead.name}</p><p className="mt-1 text-sm text-white/80">{lead.city}, {lead.state}</p></div></div>
      </div>
    </section>}
    <section className={"border-y " + theme.border + " bg-white"}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-5 sm:grid-cols-3 sm:px-8 lg:px-10">{[{ title: "Atendimento direto", desc: "Converse com a equipe", icon: MessageCircle }, { title: "Presença local", desc: lead.city + ", " + lead.state, icon: MapPin }, { title: "Informação clara", desc: "Tire suas dúvidas antes de decidir", icon: ShieldCheck }].map((item, i) => <div key={item.title} className={"flex items-center gap-4 py-5 sm:px-5 sm:py-7 " + (i ? "border-t border-slate-100 sm:border-l sm:border-t-0" : "")}><span className={"flex size-11 shrink-0 items-center justify-center rounded-xl " + theme.soft + " " + theme.accent}><item.icon className="size-5" /></span><div><p className="font-extrabold">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.desc}</p></div></div>)}</div>
    </section>
    <section id="servicos" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div className="max-w-2xl"><p className={"text-[10px] font-black uppercase tracking-[0.24em] " + theme.accent}>Conheça nosso trabalho</p><h2 className={"mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl " + ((isBeauty || isFood) ? "font-serif" : "font-sans font-black")}>{theme.section}</h2><p className={"mt-4 max-w-xl leading-7 " + theme.muted}>Informações objetivas para você conhecer as opções e falar com a equipe sobre o que precisa.</p></div>{wa && <a href={wa} target="_blank" rel="noreferrer" className={"inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 " + theme.solid}>Consultar pelo WhatsApp<ArrowRight className="size-4" /></a>}</div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">{services.map((service, i) => <article key={service.title} className={"group overflow-hidden rounded-[1.5rem] border bg-white transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-950/[0.08] " + theme.border}><div className="relative h-56 overflow-hidden sm:h-64"><img src={service.image.src} alt={service.image.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" /><span className="absolute bottom-4 left-4 text-xs font-black tracking-[0.18em] text-white">0{i + 1}</span></div><div className="p-6 sm:p-7"><h3 className="text-xl font-extrabold tracking-tight">{service.title}</h3><p className={"mt-3 min-h-[72px] text-sm leading-6 " + theme.muted}>{service.desc}</p><a href={wa || "#contato"} target={wa ? "_blank" : undefined} rel={wa ? "noreferrer" : undefined} className={"mt-5 inline-flex items-center gap-2 text-sm font-extrabold " + theme.accent}>Consultar detalhes<ArrowRight className="size-4 transition group-hover:translate-x-1" /></a></div></article>)}</div>
    </section>
    <section id="sobre" className="scroll-mt-24 bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.95fr_1.05fr] lg:gap-16 lg:px-10">
        <div className={"relative min-h-[350px] overflow-hidden rounded-[1.5rem] sm:min-h-[510px] " + (isBeauty ? "order-2 lg:order-1" : "")}><img src={images[1].src} alt={images[1].alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7"><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70">Nossa localização</p><p className="mt-2 text-2xl font-bold">{lead.city}, {lead.state}</p></div></div>
        <div className={isBeauty ? "order-1 lg:order-2" : ""}><p className={"text-[10px] font-black uppercase tracking-[0.24em] " + theme.accent}>Sobre {lead.name}</p><h2 className={"mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl " + ((isBeauty || isFood) ? "font-serif" : "font-sans font-black")}>Um atendimento pensado para as pessoas.</h2><p className={"mt-6 leading-8 " + theme.muted}>{lead.name} está em {lead.city}, {lead.state}. Esta página reúne informações para ajudar você a conhecer a empresa e iniciar uma conversa com a equipe.</p><p className={"mt-4 leading-8 " + theme.muted}>Entre em contato para confirmar os serviços, valores, horários e condições atualizadas. A equipe poderá orientar você de acordo com sua necessidade.</p><div className="mt-7 space-y-4">{["Converse diretamente com a equipe", "Consulte informações antes de decidir", "Combine os próximos passos com clareza"].map((item) => <div key={item} className="flex items-center gap-3"><span className={"flex size-8 shrink-0 items-center justify-center rounded-full " + theme.soft + " " + theme.accent}><Check className="size-4" /></span><span className="text-sm font-bold text-slate-700">{item}</span></div>)}</div>{wa && <a href={wa} target="_blank" rel="noreferrer" className={"mt-8 inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 " + theme.solid}>Falar com a equipe<MessageCircle className="size-4" /></a>}</div>
      </div>
    </section>
    <section className={theme.dark + " " + theme.darkText}>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-10"><div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Como começar</p><h2 className={"mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl " + ((isBeauty || isFood) ? "font-serif" : "font-sans font-black")}>Um primeiro contato, sem complicação.</h2><p className="mt-4 max-w-md text-sm leading-7 text-white/65">Conte o que você procura e receba as informações necessárias diretamente da empresa.</p></div><div className="grid gap-3 sm:grid-cols-3">{[{ n: "01", title: "Fale conosco", desc: "Conte sua necessidade ou dúvida." }, { n: "02", title: "Consulte opções", desc: "Conheça os serviços e condições." }, { n: "03", title: "Combine os detalhes", desc: "Confirme os próximos passos." }].map((item) => <div key={item.n} className="border-t border-white/20 pt-5"><p className={"text-xs font-black tracking-[0.2em] " + (isAuto ? "text-cyan-300" : "text-white/45")}>{item.n}</p><h3 className="mt-4 font-extrabold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/60">{item.desc}</p></div>)}</div></div>
    </section>
    <section id="duvidas" className="scroll-mt-24 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.75fr_1.25fr] lg:px-10"><div><p className={"text-[10px] font-black uppercase tracking-[0.24em] " + theme.accent}>Perguntas frequentes</p><h2 className={"mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl " + ((isBeauty || isFood) ? "font-serif" : "font-sans font-black")}>Informações importantes.</h2><p className={"mt-5 leading-7 " + theme.muted}>Se sua dúvida não estiver aqui, fale com a equipe para receber uma orientação direta.</p>{wa && <a href={wa} target="_blank" rel="noreferrer" className={"mt-6 inline-flex items-center gap-2 text-sm font-extrabold " + theme.accent}>Perguntar pelo WhatsApp<MessageCircle className="size-4" /></a>}</div><div className="space-y-3">{faqs.map((faq, i) => <div key={faq.q} className={"overflow-hidden rounded-2xl border bg-white " + theme.border}><button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-bold transition hover:bg-slate-50"><span>{faq.q}</span><span className={"flex size-8 shrink-0 items-center justify-center rounded-full " + theme.soft + " " + theme.accent}><ChevronDown className={"size-4 transition " + (openFaq === i ? "rotate-180" : "")} /></span></button>{openFaq === i && <p className={"px-5 pb-5 text-sm leading-7 " + theme.muted}>{faq.a}</p>}</div>)}</div></div>
    </section>
    <section id="contato" className={"scroll-mt-24 " + theme.page}>
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10"><div className={"relative overflow-hidden rounded-[1.75rem] px-6 py-10 sm:px-10 sm:py-14 lg:px-14 " + theme.dark + " text-white"}><div className="absolute -right-20 -top-24 size-72 rounded-full border border-white/10" /><div className="absolute -right-8 -top-12 size-48 rounded-full border border-white/10" /><div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div className="max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Entre em contato</p><h2 className={"mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl " + ((isBeauty || isFood) ? "font-serif" : "font-sans font-black")}>{theme.cta}</h2><p className="mt-4 leading-7 text-white/65">Fale com {lead.name} em {lead.city}, {lead.state}, e consulte as informações de que precisa.</p></div><div className="relative flex flex-col gap-3 sm:flex-row lg:flex-col">{wa && <a href={wa} target="_blank" rel="noreferrer" className={"inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-extrabold text-white " + theme.solid}><MessageCircle className="size-5" />Conversar pelo WhatsApp<ArrowRight className="size-4" /></a>}<a href="#inicio" className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-6 py-4 text-sm font-bold text-white/80 transition hover:bg-white/10">Voltar ao início</a></div></div></div></div>
    </section>
    <footer className="border-t border-black/[0.06] bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10"><div><p className="font-extrabold">{lead.name}</p><p className={"mt-1 text-sm " + theme.muted}>{lead.niche} · {lead.city}, {lead.state}</p><p className="mt-2 text-xs text-slate-400">© {new Date().getFullYear()} {lead.name}. Todos os direitos reservados.</p></div><div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-slate-500"><a href="#inicio" className="hover:text-slate-900">Início</a><a href="#servicos" className="hover:text-slate-900">Serviços</a><a href="#sobre" className="hover:text-slate-900">A empresa</a><button type="button" onClick={onBack} className="inline-flex items-center gap-1 hover:text-slate-900"><ArrowLeft className="size-4" />Voltar ao ProspecMap</button></div></div><div className="border-t border-slate-100 px-5 py-3 text-center text-[10px] text-slate-400">Prévia demonstrativa. As imagens são ilustrativas; substitua por fotos reais e confirme as informações antes de publicar.</div></footer>
    {wa && <a href={wa} target="_blank" rel="noreferrer" aria-label="Conversar pelo WhatsApp" className={"fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full text-white shadow-xl transition duration-300 hover:scale-105 " + theme.solid}><MessageCircle className="size-7" /></a>}
  </main>
}
