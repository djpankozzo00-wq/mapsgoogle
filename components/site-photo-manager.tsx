'use client'

import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, Trash2, X } from 'lucide-react'

export type SitePhoto = { id: string; url: string; path: string; name: string; createdAt: string }

export default function SitePhotoManager({ siteId, token, initialPhotos = [] }: { siteId: string; token: string; initialPhotos?: SitePhoto[] }) {
  const [photos, setPhotos] = useState<SitePhoto[]>(initialPhotos)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file?: File) => {
    if (!file) return
    if (!token.trim()) { setMessage('Digite a credencial administrativa acima antes de enviar fotos.'); return }
    const form = new FormData()
    form.set('token', token)
    form.set('siteId', siteId)
    form.set('file', file)
    setBusy(true); setMessage('Enviando imagem...')
    try {
      const response = await fetch('/api/sites/photos', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Falha ao enviar imagem.')
      setPhotos(Array.isArray(data.photos) ? data.photos : [...photos, data.photo])
      setMessage('Foto adicionada ao site.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível enviar a foto.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = async (photo: SitePhoto) => {
    if (!token.trim()) { setMessage('Digite a credencial administrativa acima.'); return }
    if (!window.confirm('Excluir esta foto do site da empresa?')) return
    setBusy(true); setMessage('Excluindo foto...')
    try {
      const response = await fetch('/api/sites/photos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, siteId, photoId: photo.id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Falha ao excluir foto.')
      setPhotos(Array.isArray(data.photos) ? data.photos : photos.filter(item => item.id !== photo.id))
      setMessage('Foto excluída.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível excluir a foto.')
    } finally { setBusy(false) }
  }

  return <div className="mt-4 rounded-xl border border-dashed border-[#b8cbc8] bg-white p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><p className="text-sm font-bold text-slate-800">Fotos do site ({photos.length}/12)</p><p className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP · até 5 MB por foto</p></div>
      <button type="button" disabled={busy || photos.length >= 12} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-[#172b42] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}Adicionar fotos</button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy || photos.length >= 12} onChange={event => void upload(event.target.files?.[0])} />
    </div>
    {photos.length > 0 ? <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">{photos.map(photo => <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200"><img src={photo.url} alt={photo.name || 'Foto da empresa'} className="size-full object-cover" /><button type="button" disabled={busy} onClick={() => void remove(photo)} aria-label="Excluir foto" className="absolute right-1 top-1 rounded-full bg-red-600 p-1.5 text-white shadow disabled:opacity-50"><Trash2 className="size-3.5" /></button></div>)}</div> : <p className="mt-3 rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">Nenhuma foto adicionada. As imagens enviadas aparecerão na galeria do site público.</p>}
    {message && <div role="status" className="mt-3 flex items-start justify-between gap-2 rounded-lg bg-slate-100 p-2.5 text-xs text-slate-700"><span className="break-words">{message}</span><button type="button" onClick={() => setMessage('')} aria-label="Fechar mensagem"><X className="size-3.5" /></button></div>}
  </div>
}
