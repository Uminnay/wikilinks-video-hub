"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAppStore } from "@/store/useAppStore"
import { useDebouncedSave } from "@/hooks/useDebouncedSave"

export default function VideoDetailView({ videoId }: { videoId: string }) {
  const router = useRouter()
  
  const allVideos = useAppStore(state => state.videos)
  const categories = useAppStore(state => state.categories)
  const priorities = useAppStore(state => state.priorities)
  const tags = useAppStore(state => state.tags)
  const updateVideoStore = useAppStore(state => state.updateVideo)
  
  const allActions = useAppStore(state => state.actions)
  const addAction = useAppStore(state => state.addAction)
  const updateAction = useAppStore(state => state.updateAction)
  const deleteAction = useAppStore(state => state.deleteAction)
  
  const [mounted, setMounted] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryErrorDetails, setSummaryErrorDetails] = useState<string | null>(null)
  const [summaryExpanded, setSummaryExpanded] = useState(false)
  const [showCompletedActions, setShowCompletedActions] = useState(false)
  
  // Custom dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  
  const video = allVideos.find(v => v.id === videoId)
  const [noteContent, setNoteContent] = useState("")
  const [newActionTitle, setNewActionTitle] = useState("")

  // Auto-save notes with debounce
  const { status: noteSaveStatus } = useDebouncedSave(
    noteContent,
    async (value) => { await updateVideoStore(videoId, { personal_notes: value }) },
    800
  )

  useEffect(() => {
    setMounted(true)
    if (video) {
      setNoteContent(video.personal_notes || "")
    }
  }, [video?.id]) // Only reset when video ID changes, not on every update

  if (!mounted) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  if (!video) {
    return <div className="text-center py-10 text-onSurface-muted">Vídeo no encontrado</div>
  }

  const updateVideo = (updates: any) => {
    updateVideoStore(videoId, updates)
  }

  const handlePriorityChange = (priorityId: string) => {
    updateVideo({ priority: video.priority === priorityId ? null : priorityId })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateVideo({ category: e.target.value })
  }

  // handleSaveNote removed — auto-save via useDebouncedSave

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActionTitle.trim()) return
    addAction({
      title: newActionTitle.trim(),
      status: 'pending',
      video_id: videoId
    })
    setNewActionTitle("")
  }

  const handleToggleAction = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
    updateAction(id, { status: newStatus })
  }

  const handleGenerateSummary = async () => {
    if (!video) return
    setGeneratingSummary(true)
    setSummaryError(null)
    setSummaryErrorDetails(null)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: video.title,
          channelName: video.channel_name,
          videoId: video.youtube_video_id,
        })
      })
      const data = await res.json()
      if (res.ok && data.summary) {
        updateVideo({ ai_summary: data.summary })
      } else {
        setSummaryError(data.error || 'Error al generar el resumen')
        if (data.details) {
          setSummaryErrorDetails(JSON.stringify(data.details, null, 2))
        }
      }
    } catch (e) {
      setSummaryError('Error de conexión con la IA')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const formatDuration = (seconds: any) => {
    if (!seconds) return null
    if (typeof seconds === 'string') {
      if (seconds.startsWith('PT')) {
         const match = seconds.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
         if (match) {
           const h = parseInt(match[1]) || 0;
           const m = parseInt(match[2]) || 0;
           const s = parseInt(match[3]) || 0;
           if (h > 0) return `${h}h ${m}m`;
           return `${m}m ${s}s`;
         }
      }
      return seconds;
    }
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
  }
  
  // Render inline **bold** markdown within a text string
  const renderInline = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g)
    return parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} className="font-semibold text-onSurface">{part}</strong>
        : <span key={i}>{part}</span>
    )
  }

  // Render formatted AI summary
  const renderSummary = (text: string) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      const trimmed = line.trim()
      if (!trimmed) return <div key={i} className="h-1.5" />
      // Section headers (lines with emoji at start)
      if (/^(🎯|💡|⚡|👥)/.test(trimmed)) {
        return (
          <h4 key={i} className="text-sm font-semibold text-primary mt-3 mb-1.5 first:mt-0 flex items-center gap-1">
            {trimmed}
          </h4>
        )
      }
      // Bullet points
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || (trimmed.startsWith('*') && !trimmed.startsWith('**'))) {
        const content = trimmed.replace(/^[•\-\*]\s*/, '')
        return (
          <div key={i} className="flex items-start gap-2 text-sm text-onSurface leading-relaxed py-0.5">
            <span className="text-primary mt-1 flex-shrink-0 text-xs">•</span>
            <span className="flex-1">{renderInline(content)}</span>
          </div>
        )
      }
      return <p key={i} className="text-sm text-onSurface leading-relaxed">{renderInline(trimmed)}</p>
    })
  }

  const formattedDuration = formatDuration(video.duration_seconds)

  return (
    <div className="flex flex-col gap-6">
      {/* Thumbnail */}
      <div className="w-full aspect-video relative rounded-xl overflow-hidden bg-surface-high border border-surface-high">
        {video.thumbnail_url ? (
          <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" />
        ) : (
           <div className="w-full h-full flex items-center justify-center text-onSurface-muted">
             <span className="material-symbols-outlined text-4xl">play_circle</span>
           </div>
        )}
      </div>

      {/* Metadata */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold tracking-tight leading-snug text-onSurface">{video.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-onSurface-muted">
          <span>{video.channel_name || 'Desconocido'}</span>
          {formattedDuration && (
            <>
              <span>•</span>
              <span>{formattedDuration}</span>
            </>
          )}
          {video.published_at && (
             <>
               <span>•</span>
               <span>{new Date(video.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
             </>
          )}
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category Selector */}
        <div className="bg-surface-low rounded-xl p-3 border border-surface-high relative">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted mb-1.5">Categoría</label>
          <div 
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full bg-transparent text-sm text-primary font-medium focus:outline-none cursor-pointer flex items-center justify-between"
          >
            <span className="truncate pr-2">{categories.find(c => c.id === video.category)?.name || 'Seleccionar'}</span>
            <span className="material-symbols-outlined text-onSurface-muted pointer-events-none text-[20px]">expand_more</span>
          </div>
          
          {isCategoryOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-low border border-surface-high rounded-xl py-2 shadow-xl z-50 max-h-48 overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { updateVideo({ category: cat.id }); setIsCategoryOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-surface-high ${video.category === cat.id ? 'text-primary font-medium' : 'text-onSurface'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status Badge */}
        <div className="bg-surface-low rounded-xl p-3 border border-surface-high relative flex flex-col justify-center">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted mb-1.5">Estado</label>
          <div 
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={`w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer flex items-center justify-between ${
              video.status === 'pending' ? 'text-priority-high' : 
              video.status === 'seen' ? 'text-onSurface-muted' : 
              video.status === 'notion_candidate' ? 'text-status-notion' : 'text-error'
            }`}
          >
            <span>
              {video.status === 'pending' ? 'Pendiente' : 
               video.status === 'seen' ? 'Visto' : 
               video.status === 'discarded' ? 'Descartado' : 'Notion'}
            </span>
            <span className="material-symbols-outlined text-onSurface-muted pointer-events-none text-[20px]">expand_more</span>
          </div>
          
          {isStatusOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)}></div>
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-low border border-surface-high rounded-xl py-2 shadow-xl z-50">
                <button onClick={() => { updateVideo({ status: 'pending' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Pendiente</button>
                <button onClick={() => { updateVideo({ status: 'seen' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Visto</button>
                <button onClick={() => { updateVideo({ status: 'discarded' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Descartado</button>
                <button onClick={() => { updateVideo({ status: 'notion_candidate' }); setIsStatusOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-onSurface hover:bg-surface-high transition-colors">Notion</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Priority Selector */}
      <div className="space-y-2">
        <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Prioridad</label>
        <div className="grid grid-cols-3 gap-2">
          {priorities.map(p => (
            <button 
              key={p.id}
              onClick={() => handlePriorityChange(p.id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors border ${
                video.priority === p.id
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-high border-surface-high hover:bg-surface-low'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.colorHex }}></div>
              <span className={`text-sm ${video.priority === p.id ? 'text-primary font-medium' : 'text-onSurface-muted'}`}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags Selector */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Etiquetas</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => {
              const isSelected = video.tags?.includes(tag.id)
              return (
                <button 
                  key={tag.id}
                  onClick={() => {
                    const currentTags = video.tags || []
                    const newTags = isSelected 
                      ? currentTags.filter(id => id !== tag.id)
                      : [...currentTags, tag.id]
                    updateVideo({ tags: newTags })
                  }}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-all border ${
                    isSelected
                      ? 'bg-primary/20 text-primary border-primary/40' 
                      : 'bg-surface-high/50 text-onSurface-muted border-surface-high hover:bg-surface-high'
                  }`}
                >
                  #{tag.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* URL */}
      <div className="space-y-2">
        <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">URL del Vídeo</label>
        <div className="flex items-center gap-2 bg-surface-low border border-surface-high rounded-xl px-3 py-2.5">
          <span className="material-symbols-outlined text-[16px] text-onSurface-muted flex-shrink-0">link</span>
          <span className="flex-1 text-xs text-onSurface-muted truncate">{video.url}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(video.url); }}
            className="flex-shrink-0 text-primary hover:brightness-110 transition-all"
            title="Copiar URL"
          >
            <span className="material-symbols-outlined text-[16px]">content_copy</span>
          </button>
        </div>
      </div>

      {/* Personal Notes — auto-save */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Notas Personales</label>
          <span className={`text-[10px] transition-all duration-300 flex items-center gap-1 ${
            noteSaveStatus === 'saving' ? 'text-onSurface-muted' :
            noteSaveStatus === 'saved' ? 'text-green-400' :
            noteSaveStatus === 'error' ? 'text-red-400' : 'opacity-0'
          }`}>
            {noteSaveStatus === 'saving' && <><span className="material-symbols-outlined text-[12px] animate-spin">sync</span> Guardando...</>}
            {noteSaveStatus === 'saved' && <><span className="material-symbols-outlined text-[12px]">check_circle</span> Guardado</>}
            {noteSaveStatus === 'error' && <><span className="material-symbols-outlined text-[12px]">error</span> Error</>}
          </span>
        </div>
        <textarea 
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Añade una nota personal, ideas, timestamps..."
          className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-lg p-3 min-h-[120px] focus:outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      {/* Acciones vinculadas */}
      <div className="space-y-3">
        <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
          Acciones
        </label>
        
        <div className="flex flex-col gap-2">
          {(() => {
            const videoActions = allActions.filter(a => a.video_id === videoId)
            const pendingActions = videoActions.filter(a => a.status === 'pending')
            const completedActions = videoActions.filter(a => a.status === 'completed')
            
            return (
              <>
                {/* Listado de acciones pendientes */}
                {pendingActions.map(action => (
                  <div key={action.id} className="bg-surface-low rounded-xl p-3 border border-surface-high group hover:border-primary/30 flex items-start gap-3 transition-colors">
                    <button 
                      onClick={() => handleToggleAction(action.id, action.status)}
                      className="w-6 h-6 rounded-full border-2 border-surface-high group-hover:border-primary flex items-center justify-center mt-0.5 transition-colors"
                    >
                      <div className="w-3 h-3 rounded-full bg-primary opacity-0 transition-opacity"></div>
                    </button>
                    <p className="text-sm flex-1 min-w-0 text-onSurface">
                      {action.title}
                    </p>
                  </div>
                ))}

                {/* Formulario para nueva acción */}
                <form onSubmit={handleAddAction} className="flex gap-2 mt-1">
                  <input 
                    type="text"
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                    placeholder="Añadir acción..."
                    className="flex-1 bg-surface-low border border-surface-high text-onSurface text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!newActionTitle.trim()}
                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_4px_12px_rgba(124,92,252,0.3)]"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </form>

                {/* Acciones completadas */}
                {completedActions.length > 0 && (
                  <div className="mt-2">
                    <button 
                      onClick={() => setShowCompletedActions(!showCompletedActions)}
                      className="flex items-center gap-2 text-xs font-medium text-onSurface-muted hover:text-onSurface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {showCompletedActions ? 'expand_less' : 'expand_more'}
                      </span>
                      Acciones realizadas ({completedActions.length})
                    </button>
                    
                    {showCompletedActions && (
                      <div className="flex flex-col gap-2 mt-3 pl-2 border-l-2 border-surface-high">
                        {completedActions.map(action => (
                          <div key={action.id} className="group flex items-start gap-3">
                            <button 
                              onClick={() => handleToggleAction(action.id, action.status)}
                              className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center mt-0.5"
                            >
                              <span className="material-symbols-outlined text-[12px] text-white">check</span>
                            </button>
                            <p className="text-sm text-onSurface-muted line-through flex-1">{action.title}</p>
                            <button 
                              onClick={() => deleteAction(action.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-error/70 hover:text-error p-1"
                              title="Eliminar acción"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>

      {/* AI Summary Block */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
            Resumen IA
          </label>
          {video.ai_summary && (
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="text-primary text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Regenerar
            </button>
          )}
        </div>

        {video.ai_summary ? (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl">
            {/* Collapsed preview */}
            {!summaryExpanded ? (
              <div className="relative p-4 max-h-[130px] overflow-hidden">
                <div className="space-y-1">{renderSummary(video.ai_summary)}</div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-1">{renderSummary(video.ai_summary)}</div>
              </div>
            )}
            {/* Toggle button - always outside the clipped area */}
            <button
              onClick={() => setSummaryExpanded(prev => !prev)}
              className="w-full px-4 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary border-t border-primary/15 hover:bg-primary/5 transition-colors rounded-b-xl"
            >
              <span className="material-symbols-outlined text-[14px]">
                {summaryExpanded ? 'expand_less' : 'expand_more'}
              </span>
              {summaryExpanded ? 'Ver menos' : 'Ver análisis completo'}
            </button>
          </div>
        ) : (
          <div className="bg-surface-low border border-surface-high border-dashed rounded-xl p-5 flex flex-col items-center gap-3 text-center">
            {summaryError ? (
              <>
                <span className="material-symbols-outlined text-error text-2xl">error</span>
                <p className="text-xs text-error font-medium">{summaryError}</p>
                {summaryErrorDetails && (
                  <pre className="text-[9px] text-error/60 bg-error/5 p-2 rounded text-left overflow-auto max-h-20 w-full">{summaryErrorDetails}</pre>
                )}
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:brightness-110 disabled:opacity-50"
                >
                  Reintentar
                </button>
              </>
            ) : generatingSummary ? (
              <>
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-onSurface-muted">Analizando con IA...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-onSurface">Generar resumen con IA</p>
                  <p className="text-xs text-onSurface-muted mt-0.5">Obtén un resumen del contenido del vídeo antes de verlo</p>
                </div>
                <button
                  onClick={handleGenerateSummary}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-[#947DFF] text-white text-xs font-semibold rounded-xl shadow-[0_4px_12px_rgba(124,92,252,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  Analizar vídeo
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <a 
          href={video.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-surface-high text-primary border border-surface-high hover:border-primary/50 text-sm font-medium transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
          Ver en YouTube
        </a>
        
        <div className="grid grid-cols-2 gap-2">
          {video.status !== 'seen' && (
            <button 
              onClick={() => updateVideo({ status: 'seen' })}
              className="py-3 rounded-xl bg-surface-low border border-surface-high hover:bg-surface-high text-sm font-medium text-onSurface transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              Marcar visto
            </button>
          )}
          
          {video.notion_status !== 'candidate' && (
            <button 
              onClick={() => updateVideo({ notion_status: 'candidate' })}
              className="py-3 rounded-xl bg-status-notion/10 border border-status-notion/20 hover:bg-status-notion/20 text-sm font-medium text-status-notion transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.739 0 1.258.125 1.705.41l.161.104 12.015 8.76V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h5.452v1.208h-.311c-.636 0-.965.358-.965 1.211v15.582c0 .284-.131.547-.361.713-.23.165-.526.212-.796.126l-.168-.063L5.451 11.233V18.58c0 .284-.131.547-.361.713s-.526.212-.796.126l-.168-.063L5.451 11.233V18.58c0 .853.33 1.211.965 1.211h.311V21H1.275v-1.208h.311c.636 0 .965-.358.965-1.211V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h3.184z"/>
              </svg>
              Candidato Notion
            </button>
          )}

          {video.status !== 'discarded' && (
            <button 
              onClick={() => updateVideo({ status: 'discarded' })}
              className={`py-3 rounded-xl bg-error/10 border border-error/20 hover:bg-error/20 text-sm font-medium text-error transition-colors flex items-center justify-center gap-2 ${video.status === 'seen' || video.notion_status === 'candidate' ? 'col-span-2' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Descartar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
