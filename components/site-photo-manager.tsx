'use client'

import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2, X, BadgeCheck } from 'lucide-react'

export type SitePhoto = { id: string; url: string; path: string; name: string; createdAt: string }

export default function SitePhotoManager({ siteId, token, initialPhotos = [], initialLogo = '' }: { siteId: string; token: string; initialPhotos?: SitePhoto[]; initialLogo?: string }) {
  const [photos, setPhotos] = useState<SitePhoto[]>(initialPhotos)
  const [logo, setLogo] = useState(initialLogo)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const photoInput = useRef<HTMLInputElement>(null)
  const logoInput = useRef<HTMLInputElement>(null)

  const upload = async (file: File | undefined, kind: 'photo' | 'logo') => {
    if (!file) return
    if (!token.trim()) { setMessage('Digite a credencial administrativa antes de enviar imagens.'); return }
    const form = new FormData()
    form.set('token', token); form.set('siteId', siteId); form.set('file', file); form.set('kind', kind)
    setBusy(true); setMessage(kind === 'logo' ? 'Enviando logotipo...' : 'Enviando foto...')
    try {
      const response = await fetch('/api/sites/photos', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Falha ao enviar imagem.')
      if (kind === 'logo') setLogo(data.logoUrl || '')
      else setPhotos(Array.isArray(data.photos) ? data.photos : [...photos, data.photo])
      setMessage(kind === 'logo' ? 'Logotipo atualizado no site.' : 'Foto adicionada à galeria e distribuída pelo site.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.') }
    finally { setBusy(false); if (photoInput.current) photoInput.current.value = ''; if (logoInput.current) logoInput.current.value = '' }
  }

  const remove = async (photo?: SitePhoto, kind: 'photo' | 'logo' = 'photo') => {
    if (!token.trim()) { setMessage('Digite a credencial administrativa antes de excluir.'); return }
    if (!window.confirm(kind === 'logo' ? 'Remover o logotipo deste site?' : 'Excluir esta foto do site da empresa?')) return
    setBusy(true); setMessage('Excluindo imagem...')
    try {
      const response = await fetch('/api/sites/photos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, siteId, photoId: photo?.id, kind }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Falha ao excluir imagem.')
      if (kind === 'logo') setLogo('')
      else setPhotos(Array.isArray(data.photos) ? data.photos : photos.filter(item => item.id !== photo?.id))
      setMessage(kind === 'logo' ? 'Logotipo removido.' : 'Foto excluída.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível excluir a imagem.') }
    finally { setBusy(false) }
  }

  return <div className="mt-4 space-y-3 rounded-xl border border-dashed border-[#b8cbc8] bg-white p-3">
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">{logo ? <img src={logo} alt="Logotipo atual" className="size-14 rounded-xl border border-slate-200 bg-white object-contain p-1"/> : <span className="grid size-14 place-items-center rounded-xl bg-slate-100 text-slate-400"><BadgeCheck className="size-6"/></span>}<div><p className="text-sm font-bold text-slate-800">Logotipo da empresa</p><p className="mt-1 text-xs text-slate-500">Enviado separadamente · até 2 MB</p></div></div>
        <div className="flex gap-2"><button type="button" disabled={busy} onClick={() => logoInput.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-[#172b42] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? <LoaderCircle className="size-4 animate-spin"/> : <ImagePlus className="size-4"/>}{logo ? 'Trocar logotipo' : 'Enviar logotipo'}</button>{logo && <button type="button" disabled={busy} onClick={() => void remove(undefined,'logo')} aria-label="Excluir logotipo" className="rounded-lg border border-red-200 p-2 text-red-700 disabled:opacity-50"><Trash2 className="size-4"/></button>}</div>
        <input ref={logoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={event => void upload(event.target.files?.[0], 'logo')}/>
      </div>
    </div>
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-slate-800">Fotos para o site ({photos.length}/12)</p><p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP · até 5 MB por foto</p></div><button type="button" disabled={busy || photos.length >= 12} onClick={() => photoInput.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-[#172b42] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? <LoaderCircle className="size-4 animate-spin"/> : <ImagePlus className="size-4"/>}Adicionar fotos</button><input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy || photos.length >= 12} onChange={event => void upload(event.target.files?.[0], 'photo')}/></div>
      {photos.length ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{photos.map(photo => <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"><img src={photo.url} alt={photo.name || 'Foto da empresa'} className="size-full object-cover"/><button type="button" disabled={busy} onClick={() => void remove(photo)} aria-label="Excluir foto" className="absolute right-1 top-1 rounded-full bg-red-600 p-1.5 text-white shadow disabled:opacity-50"><Trash2 className="size-3.5"/></button></div>)}</div> : <p className="mt-3 rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">Nenhuma foto adicionada ainda.</p>}
      <p className="mt-3 text-xs leading-5 text-slate-500">As fotos serão usadas na imagem principal, em blocos entre as seções e na galeria, para deixar o site mais visual.</p>
    </div>
    {message && <div role="status" className="flex items-start justify-between gap-2 rounded-lg bg-slate-100 p-2.5 text-xs text-slate-700"><span className="break-words">{message}</span><button type="button" onClick={() => setMessage('')} aria-label="Fechar mensagem"><X className="size-3.5"/></button></div>}
  </div>
}
