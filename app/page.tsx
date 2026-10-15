'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Check,
  ChevronDown,
  CirclePlus,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  StickyNote,
  X,
} from 'lucide-react'

type LeadStatus = 'A contactar' | 'Em negociação' | 'Fechado' | 'Rejeitado'

type Lead = {
  id: string
  name: string
  niche: string
  city: string
  state: string
  country: string
  status: LeadStatus
  whatsapp: string
  notes: string
}

const statuses: LeadStatus[] = ['A contactar', 'Em negociação', 'Fechado', 'Rejeitado']

const exampleLeads: Lead[] = [
  {
    id: 'example-1',
    name: 'Pizzaria Bella Napoli',
    niche: 'Pizzaria',
    city: 'Campinas',
    state: 'SP',
    country: 'Brasil',
    status: 'A contactar',
    whatsapp: '5519998765432',
    notes: 'Encontrada no Google Maps. Instagram ativo, mas sem site próprio.',
  },
  {
    id: 'example-2',
    name: 'Auto Center Horizonte',
    niche: 'Mecânica',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    status: 'Em negociação',
    whatsapp: '5531987654321',
    notes: 'Proprietário pediu para receber o portfólio na próxima semana.',
  },
  {
    id: 'example-3',
    name: 'Studio Corte & Estilo',
    niche: 'Salão de beleza',
    city: 'Curitiba',
    state: 'PR',
    country: 'Brasil',
    status: 'Fechado',
    whatsapp: '5541987654321',
    notes: 'Projeto aprovado. Aguardando envio do briefing inicial.',
  },
]

const statusStyles: Record<LeadStatus, string> = {
  'A contactar': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Em negociação': 'bg-blue-50 text-blue-700 ring-blue-200',
  Fechado: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Rejeitado: 'bg-slate-100 text-slate-500 ring-slate-200',
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, '')
}

export default function Page() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [nicheFilter, setNicheFilter] = useState('Todos')
  const [cityFilter, setCityFilter] = useState('Todas')
  const [stateFilter, setStateFilter] = useState('Todos')
  const [statusFilter, setStatusFilter] = useState<'Todos' | LeadStatus>('Todos')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedLeads = window.localStorage.getItem('prospecmap-leads')
    setLeads(savedLeads ? JSON.parse(savedLeads) : exampleLeads)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) window.localStorage.setItem('prospecmap-leads', JSON.stringify(leads))
  }, [leads, isLoaded])

  const options = useMemo(() => ({
    niches: [...new Set(leads.map((lead) => lead.niche))].sort(),
    cities: [...new Set(leads.map((lead) => lead.city))].sort(),
    states: [...new Set(leads.map((lead) => lead.state))].sort(),
  }), [leads])

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const searchable = `${lead.name} ${lead.niche} ${lead.city} ${lead.state} ${lead.notes}`.toLowerCase()
    return searchable.includes(search.toLowerCase())
      && (nicheFilter === 'Todos' || lead.niche === nicheFilter)
      && (cityFilter === 'Todas' || lead.city === cityFilter)
      && (stateFilter === 'Todos' || lead.state === stateFilter)
      && (statusFilter === 'Todos' || lead.status === statusFilter)
  }), [leads, search, nicheFilter, cityFilter, stateFilter, statusFilter])

  function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const newLead: Lead = {
      id: crypto.randomUUID(),
      name: String(form.get('name') || ''),
      niche: String(form.get('niche') || ''),
      city: String(form.get('city') || ''),
      state: String(form.get('state') || ''),
      country: String(form.get('country') || 'Brasil'),
      status: String(form.get('status') || 'A contactar') as LeadStatus,
      whatsapp: normalizePhone(String(form.get('whatsapp') || '')),
      notes: String(form.get('notes') || ''),
    }
    setLeads((current) => [newLead, ...current])
    setIsFormOpen(false)
    event.currentTarget.reset()
  }

  const clearFilters = () => {
    setSearch('')
    setNicheFilter('Todos')
    setCityFilter('Todas')
    setStateFilter('Todos')
    setStatusFilter('Todos')
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="bg-[#071b3a] text-white">
        <div className="mx-auto max-w-6xl px-4 pb-7 pt-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-400 text-[#071b3a] shadow-lg shadow-cyan-950/20">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">ProspecMap</p>
                <p className="text-xs text-blue-200">Seus leads, sempre à mão.</p>
              </div>
            </div>
            <button onClick={() => setIsFormOpen(true)} className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#071b3a] shadow-lg transition hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-300" type="button">
              <CirclePlus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Adicionar lead</span>
              <span className="sm:hidden">Novo</span>
            </button>
          </div>
          <div className="mt-7 max-w-2xl">
            <p className="mb-2 text-sm font-medium text-cyan-300">Painel de prospecção</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Encontre sua próxima oportunidade.</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100">Organize empresas encontradas no Google Maps e entre em contato no momento certo.</p>
          </div>
        </div>
      </header>

      <section className="mx-auto -mt-5 max-w-6xl px-4 sm:px-6 lg:px-8" aria-label="Busca e filtros">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 sm:p-4">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-100">
            <Search className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Buscar leads</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Buscar por empresa, nicho ou cidade..." />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar busca"><X className="size-4 text-slate-400" /></button>}
          </label>
          <div className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Filter className="size-3.5" aria-hidden="true" /> Filtros rápidos</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <FilterSelect label="Nicho" value={nicheFilter} options={['Todos', ...options.niches]} onChange={setNicheFilter} />
            <FilterSelect label="Cidade" value={cityFilter} options={['Todas', ...options.cities]} onChange={setCityFilter} />
            <FilterSelect label="Estado" value={stateFilter} options={['Todos', ...options.states]} onChange={setStateFilter} />
            <FilterSelect label="Status" value={statusFilter} options={['Todos', ...statuses]} onChange={setStatusFilter} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><p className="text-sm font-semibold text-slate-500">Sua carteira</p><h2 className="text-xl font-bold tracking-tight text-slate-900">{filteredLeads.length} {filteredLeads.length === 1 ? 'lead encontrado' : 'leads encontrados'}</h2></div>
          {(search || nicheFilter !== 'Todos' || cityFilter !== 'Todas' || stateFilter !== 'Todos' || statusFilter !== 'Todos') && <button onClick={clearFilters} className="text-sm font-semibold text-cyan-700 hover:text-cyan-900" type="button">Limpar filtros</button>}
        </div>
        {filteredLeads.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><Building2 className="mx-auto size-9 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Nenhum lead encontrado</p><p className="mt-1 text-sm text-slate-500">Tente ajustar os filtros ou adicione uma nova empresa.</p></div> : <div className="grid gap-4 md:grid-cols-2">{filteredLeads.map((lead) => <LeadCard key={lead.id} lead={lead} onStatusChange={(status) => setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item))} />)}</div>}
      </section>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071b3a]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsFormOpen(false)}>
        <form onSubmit={addLead} className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7" aria-label="Adicionar novo lead">
          <div className="mb-6 flex items-start justify-between"><div><p className="text-sm font-bold text-cyan-700">Novo cadastro</p><h2 className="mt-1 text-2xl font-bold tracking-tight">Adicionar novo lead</h2></div><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Fechar formulário"><X className="size-5" /></button></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome da empresa" name="name" placeholder="Ex: Café Central" required />
            <Field label="Nicho" name="niche" placeholder="Ex: Pizzaria" required />
            <Field label="Cidade" name="city" placeholder="Ex: São Paulo" required />
            <Field label="Estado" name="state" placeholder="Ex: SP" maxLength={2} required />
            <Field label="País" name="country" placeholder="Brasil" defaultValue="Brasil" required />
            <Field label="WhatsApp com DDD" name="whatsapp" placeholder="Ex: (11) 99999-9999" inputMode="tel" required />
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">Status<select name="status" defaultValue="A contactar" className="h-11 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700 sm:col-span-2">Notas / observações<textarea name="notes" placeholder="Anote o que percebeu no Google Maps..." rows={3} className="resize-none rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" /></label>
          </div>
          <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#071b3a] font-bold text-white transition hover:bg-[#0d2c5c] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"><Check className="size-5" />Salvar lead</button>
        </form>
      </div>}
    </main>
  )
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="relative"><span className="sr-only">Filtrar por {label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-xs font-semibold text-slate-600 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"><option value={options[0]}>{label}: {options[0]}</option>{options.slice(1).map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-3 size-3.5 text-slate-400" aria-hidden="true" /></label>
}

function Field({ label, name, placeholder, required, defaultValue, maxLength, inputMode }: { label: string; name: string; placeholder: string; required?: boolean; defaultValue?: string; maxLength?: number; inputMode?: 'tel' }) {
  return <label className="grid gap-1.5 text-sm font-semibold text-slate-700"><span>{label}</span><input name={name} placeholder={placeholder} defaultValue={defaultValue} required={required} maxLength={maxLength} inputMode={inputMode} className="h-11 rounded-xl border border-slate-200 px-3 font-normal outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" /></label>
}

function LeadCard({ lead, onStatusChange }: { lead: Lead; onStatusChange: (status: LeadStatus) => void }) {
  const whatsappUrl = `https://wa.me/${normalizePhone(lead.whatsapp)}`
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1357a6]"><Building2 className="size-5" aria-hidden="true" /></div><div className="min-w-0"><h3 className="truncate font-bold text-slate-900">{lead.name}</h3><p className="mt-0.5 text-sm text-slate-500">{lead.niche}</p></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${statusStyles[lead.status]}`}>{lead.status}</span></div>
    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><MapPin className="size-4 shrink-0 text-cyan-600" aria-hidden="true" /><span>{lead.city}, {lead.state} · {lead.country}</span></div>
    {lead.notes && <div className="mt-3 flex gap-2 rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-600"><StickyNote className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" /><p>{lead.notes}</p></div>}
    <div className="mt-5 flex gap-2"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#16a05d] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#12834c] focus:outline-none focus:ring-2 focus:ring-emerald-300"><MessageCircle className="size-4" aria-hidden="true" />Chamar no WhatsApp</a><label className="relative"><span className="sr-only">Alterar status de {lead.name}</span><select value={lead.status} onChange={(event) => onStatusChange(event.target.value as LeadStatus)} className="h-11 w-[42px] cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white text-transparent outline-none focus:border-cyan-500"><option disabled>Alterar status</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select><ChevronDown className="pointer-events-none absolute left-3 top-3.5 size-4 text-slate-500" aria-hidden="true" /></label></div>
  </article>
}
