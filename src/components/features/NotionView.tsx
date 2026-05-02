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

function getHostname(url: string) {
  if (!url) return 'Desconocido'
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export default function NotionView() {
  const allVideos = useAppStore(state => state.videos)
  const allWebLinks = useAppStore(state => state.webLinks)
  const categories = useAppStore(state => state.categories)
  const updateVideo = useAppStore(state => state.updateVideo)
  const updateWebLink = useAppStore(state => state.updateWebLink)
  const notionConfig = useAppStore(state => state.notionConfig)
  
  const [mounted, setMounted] = useState(false)
  const [preparingId, setPreparingId] = useState<string | null>(null)
  
  const videos = allVideos.filter(v => v.notion_status === 'candidate' || v.notion_status === 'prepared' || v.notion_status === 'exported').map(v => ({ ...v, type: 'video' as const }))
  const webLinks = allWebLinks.filter(w => w.notion_status === 'candidate' || w.notion_status === 'prepared' || w.notion_status === 'exported').map(w => ({ ...w, type: 'web' as const }))
  
  const items = [...videos, ...webLinks].sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime())
  
  // Form states (we keep them in an object to simplify)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleRemove = (item: any) => {
    if (preparingId === item.id) setPreparingId(null)
    if (item.type === 'video') {
      updateVideo(item.id, { notion_status: 'none' })
    } else {
      updateWebLink(item.id, { notion_status: 'none' })
    }
  }

  const handlePrepareClick = (item: any) => {
    if (preparingId === item.id) {
      setPreparingId(null) // toggle close
    } else {
      setPreparingId(item.id)
      setFormData({
        notion_title: item.notion_title || item.title,
        notion_category: item.notion_category || item.category,
        notion_personal_note: item.notion_personal_note || item.personal_notes || "",
        notion_related_project: item.notion_related_project || "",
        notion_date: item.notion_date || (item.type === 'video' ? item.published_at?.split('T')[0] : item.saved_at?.split('T')[0]) || new Date().toISOString().split('T')[0]
      })
    }
  }

  const handleSavePreparation = (item: any) => {
    setSaving(true)
    const updates = {
      notion_title: formData.notion_title,
      notion_category: formData.notion_category,
      notion_personal_note: formData.notion_personal_note,
      notion_related_project: formData.notion_related_project,
      notion_date: formData.notion_date,
      notion_status: 'prepared' as const
    }

    if (item.type === 'video') {
      updateVideo(item.id, updates)
    } else {
      updateWebLink(item.id, updates)
    }
    setPreparingId(null)
    setSaving(false)
  }

  const handleSaveAndExport = async (item: any) => {
    if (!notionConfig.apiKey || !notionConfig.databaseId) {
      alert("Por favor, configura tu API Key y Database ID en Ajustes > Integraciones primero.")
      return
    }

    setSaving(true)
    // 1. First save locally
    const updatedItem = {
      ...item,
      notion_title: formData.notion_title,
      notion_category: formData.notion_category,
      notion_personal_note: formData.notion_personal_note,
      notion_related_project: formData.notion_related_project,
      notion_date: formData.notion_date,
      notion_status: 'prepared' as const
    }
    
    if (item.type === 'video') {
      updateVideo(item.id, updatedItem)
    } else {
      updateWebLink(item.id, updatedItem)
    }

    // 2. Then export
    try {
      const response = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: updatedItem, config: notionConfig })
      })

      const data = await response.json()
      
      if (data.success) {
        if (item.type === 'video') {
          updateVideo(item.id, { notion_status: 'exported' })
        } else {
          updateWebLink(item.id, { notion_status: 'exported' })
        }
        setPreparingId(null)
      } else {
        throw new Error(data.error || "Error desconocido")
      }
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleExportToNotion = async (item: any) => {
    if (!notionConfig.apiKey || !notionConfig.databaseId) {
      alert("Por favor, configura tu API Key y Database ID en Ajustes > Integraciones primero.")
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video: item, config: notionConfig })
      })

      const data = await response.json()
      
      if (data.success) {
        if (item.type === 'video') {
          updateVideo(item.id, { notion_status: 'exported' })
        } else {
          updateWebLink(item.id, { notion_status: 'exported' })
        }
      } else {
        throw new Error(data.error || "Error desconocido")
      }
    } catch (err: any) {
      alert(`Error al exportar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-surface-low border border-surface-high rounded-xl mt-4 flex flex-col items-center">
        <svg className="w-10 h-10 text-onSurface-muted mb-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.459 4.208c.739 0 1.258.125 1.705.41l.161.104 12.015 8.76V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h5.452v1.208h-.311c-.636 0-.965.358-.965 1.211v15.582c0 .284-.131.547-.361.713-.23.165-.526.212-.796.126l-.168-.063L5.451 11.233V18.58c0 .853.33 1.211.965 1.211h.311V21H1.275v-1.208h.311c.636 0 .965-.358.965-1.211V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h3.184z"/>
        </svg>
        <p className="text-sm text-onSurface-muted">No hay vídeos ni enlaces para Notion.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map(item => (
        <div key={item.id} className="bg-surface-low rounded-xl border border-surface-high overflow-hidden">
          {/* Header/Summary */}
          <div className="p-3">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded bg-surface-high flex-shrink-0 relative overflow-hidden pointer-events-none">
                {item.type === 'video' && (item as any).thumbnail_url ? (
                  <Image src={(item as any).thumbnail_url} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-onSurface-muted bg-surface-high/50">
                    <span className="material-symbols-outlined">
                      {item.type === 'video' ? 'play_circle' : 'link'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-sans font-medium text-onSurface leading-tight line-clamp-2">{item.title}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-onSurface-muted">
                  <span className={`material-symbols-outlined text-[12px] ${item.type === 'video' ? 'text-status-notion' : 'text-primary'}`}>
                    {item.type === 'video' ? 'movie' : 'article'}
                  </span>
                  <span className="truncate max-w-[120px]">
                    {item.type === 'video' ? ((item as any).channel_name || 'Desconocido') : getHostname(item.url)}
                  </span>
                  {item.type === 'video' && (item as any).duration_seconds && (
                    <>
                      <span>•</span>
                      <span>{formatDuration((item as any).duration_seconds)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Note Preview */}
            {(item.notion_personal_note || item.personal_notes) && preparingId !== item.id && (
              <div className="mt-3 bg-surface-high/50 p-2 rounded text-[11px] text-onSurface-muted italic line-clamp-2">
                {item.notion_personal_note || item.personal_notes}
              </div>
            )}

            {/* Action Buttons (Summary level) */}
            {preparingId !== item.id && (
              <div className="flex gap-2 mt-3">
                {item.notion_status === 'exported' ? (
                  <div className="flex-1 py-2 rounded-lg bg-success/10 text-success text-xs font-semibold flex items-center justify-center gap-1 border border-success/20">
                    <span className="material-symbols-outlined text-[16px]">cloud_done</span>
                    Enviado a Notion
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => handlePrepareClick(item)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                        item.notion_status === 'prepared' 
                          ? 'bg-surface-high text-onSurface-muted border border-surface-high' 
                          : 'bg-status-notion/10 text-status-notion hover:bg-status-notion/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {item.notion_status === 'prepared' ? 'edit' : 'edit_note'}
                      </span>
                      {item.notion_status === 'prepared' ? 'Editar Borrador' : 'Preparar Datos'}
                    </button>

                    {item.notion_status === 'prepared' && (
                      <button 
                        onClick={() => handleExportToNotion(item)}
                        disabled={saving}
                        className="flex-[1.5] py-2 rounded-lg bg-status-notion text-white text-xs font-bold flex items-center justify-center gap-1 hover:brightness-110 shadow-lg shadow-status-notion/20"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Enviar a Notion
                      </button>
                    )}
                  </>
                )}
                
                {item.notion_status !== 'exported' && (
                  <button 
                    onClick={() => handleRemove(item)}
                    className="px-3 py-2 rounded-lg bg-surface-high hover:bg-surface-high/80 text-onSurface-muted text-xs font-medium transition-colors"
                    title="Quitar de esta lista"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            )}
          </div>


          {/* Inline Form (Accordion) */}
          {preparingId === item.id && (
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
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-onSurface-muted pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Fecha de Emisión</label>
                <input 
                  type="date" 
                  value={formData.notion_date}
                  onChange={e => setFormData({...formData, notion_date: e.target.value})}
                  className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-status-notion transition-all"
                />
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

              {item.personal_notes && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Tus Notas Iniciales (Referencia)</label>
                  <div className="bg-background border border-surface-high p-3 rounded-lg text-[11px] text-onSurface-muted italic whitespace-pre-wrap">
                    {item.personal_notes}
                  </div>
                </div>
              )}

              {item.ai_summary && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[12px] text-primary">auto_awesome</span>
                    Resumen IA (se exportará a Notion)
                  </label>
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-[11px] text-onSurface whitespace-pre-wrap leading-relaxed">
                    {item.ai_summary}
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
                  onClick={() => handleSaveAndExport(item)}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-status-notion text-white text-sm font-bold transition-all hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-status-notion/20"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Guardar y Enviar a Notion
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
