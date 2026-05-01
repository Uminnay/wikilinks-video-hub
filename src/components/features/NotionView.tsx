"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppStore } from "@/store/useAppStore"

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "00:00"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function NotionView() {
  const allVideos = useAppStore(state => state.videos)
  const categories = useAppStore(state => state.categories)
  const updateVideo = useAppStore(state => state.updateVideo)
  
  const [mounted, setMounted] = useState(false)
  const [preparingId, setPreparingId] = useState<string | null>(null)
  
  const videos = allVideos.filter(v => v.notion_status === 'candidate' || v.notion_status === 'prepared')
  
  // Form states (we keep them in an object to simplify)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleRemove = (id: string) => {
    if (preparingId === id) setPreparingId(null)
    updateVideo(id, { notion_status: 'none' })
  }

  const handlePrepareClick = (video: any) => {
    if (preparingId === video.id) {
      setPreparingId(null) // toggle close
    } else {
      setPreparingId(video.id)
      setFormData({
        notion_title: video.notion_title || video.title,
        notion_category: video.notion_category || video.category,
        notion_personal_note: video.notion_personal_note || video.personal_notes || "",
        notion_related_project: video.notion_related_project || ""
      })
    }
  }

  const handleSavePreparation = (id: string) => {
    setSaving(true)
    updateVideo(id, {
      notion_title: formData.notion_title,
      notion_category: formData.notion_category,
      notion_personal_note: formData.notion_personal_note,
      notion_related_project: formData.notion_related_project,
      notion_status: 'prepared'
    })
    setPreparingId(null)
    setSaving(false)
  }

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-surface-low border border-surface-high rounded-xl mt-4">
        <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">description</span>
        <p className="text-sm text-onSurface-muted">No hay vídeos candidatos para Notion.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {videos.map(video => (
        <div key={video.id} className="bg-surface-low rounded-xl border border-surface-high overflow-hidden">
          {/* Header/Summary */}
          <div className="p-3">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded bg-surface-high flex-shrink-0 relative overflow-hidden pointer-events-none">
                {video.thumbnail_url ? (
                  <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-onSurface-muted">
                    <span className="material-symbols-outlined">play_circle</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-sans font-medium text-onSurface leading-tight line-clamp-2">{video.title}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-onSurface-muted">
                  <span className="truncate max-w-[120px]">{video.channel_name || 'Desconocido'}</span>
                  <span>•</span>
                  <span>{formatDuration(video.duration_seconds)}</span>
                </div>
              </div>
            </div>

            {/* Note Preview */}
            {(video.notion_personal_note || video.personal_notes) && preparingId !== video.id && (
              <div className="mt-3 bg-surface-high/50 p-2 rounded text-[11px] text-onSurface-muted italic line-clamp-2">
                {video.notion_personal_note || video.personal_notes}
              </div>
            )}

            {/* Action Buttons (Summary level) */}
            {preparingId !== video.id && (
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => handlePrepareClick(video)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                    video.notion_status === 'prepared' 
                      ? 'bg-status-notion text-white' 
                      : 'bg-surface-high text-status-notion hover:bg-status-notion/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {video.notion_status === 'prepared' ? 'check_circle' : 'edit_document'}
                  </span>
                  {video.notion_status === 'prepared' ? 'Preparado' : 'Preparar'}
                </button>
                <button 
                  onClick={() => handleRemove(video.id)}
                  className="px-4 py-2 rounded-lg bg-surface-high hover:bg-surface-high/80 text-onSurface-muted text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Inline Form (Accordion) */}
          {preparingId === video.id && (
            <div className="border-t border-surface-high bg-background p-3 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Título</label>
                <input 
                  type="text" 
                  value={formData.notion_title}
                  onChange={e => setFormData({...formData, notion_title: e.target.value})}
                  className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-status-notion transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Categoría</label>
                <div className="relative">
                  <select 
                    value={formData.notion_category}
                    onChange={e => setFormData({...formData, notion_category: e.target.value})}
                    className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-status-notion transition-all appearance-none"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-onSurface-muted pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Nota Personal (Para Notion)</label>
                <textarea 
                  value={formData.notion_personal_note}
                  onChange={e => setFormData({...formData, notion_personal_note: e.target.value})}
                  placeholder="Añade contexto, timestamps importantes o ideas clave..."
                  className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-lg p-3 min-h-[80px] focus:outline-none focus:border-status-notion transition-all"
                />
              </div>

              {video.personal_notes && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Tus Notas Iniciales (Referencia)</label>
                  <div className="bg-background border border-surface-high p-3 rounded-lg text-[11px] text-onSurface-muted italic whitespace-pre-wrap">
                    {video.personal_notes}
                  </div>
                </div>
              )}

              {video.ai_summary && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[12px] text-primary">auto_awesome</span>
                    Resumen IA (se exportará a Notion)
                  </label>
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-[11px] text-onSurface whitespace-pre-wrap leading-relaxed">
                    {video.ai_summary}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Proyecto Relacionado <span className="lowercase opacity-50">(Opcional)</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onSurface-muted text-[16px]">search</span>
                  <input 
                    type="text" 
                    value={formData.notion_related_project}
                    onChange={e => setFormData({...formData, notion_related_project: e.target.value})}
                    placeholder="Buscar en Notion..."
                    className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-status-notion transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setPreparingId(null)}
                  className="px-4 py-2.5 rounded-lg bg-surface-high text-onSurface text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleSavePreparation(video.id)}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-status-notion text-white text-sm font-medium transition-all hover:brightness-110 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save_alt</span>
                      Guardar preparación
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
