"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import VideoRow from "@/components/ui/VideoRow"
import { useAppStore } from "@/store/useAppStore"

function formatDuration(seconds: any): string {
  if (!seconds) return ""
  if (typeof seconds === 'string') {
    if (seconds.startsWith('PT')) {
       const match = seconds.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
       if (match) {
         const h = parseInt(match[1]) || 0;
         const m = parseInt(match[2]) || 0;
         const s = parseInt(match[3]) || 0;
         if (h > 0) return `${h}h ${m}m`;
         return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
       }
    }
    return seconds;
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) return `${h}h ${m}m`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function WatchNowContent() {
  const allVideos = useAppStore(state => state.videos)
  const categories = useAppStore(state => state.categories)
  const priorities = useAppStore(state => state.priorities)
  const timeFilters = useAppStore(state => state.timeFilters)
  const tags = useAppStore(state => state.tags)
  const updateVideo = useAppStore(state => state.updateVideo)

  const videos = useMemo(() => allVideos.filter(v => v.status === 'pending'), [allVideos])
  
  const [activeTimes, setActiveTimes] = useState<string[]>([])
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [activePriorities, setActivePriorities] = useState<string[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const priorityParam = searchParams.get('priority')
    if (priorityParam) {
      setActivePriorities([priorityParam])
    }
  }, [searchParams])

  const toggleFilter = (setFn: React.Dispatch<React.SetStateAction<string[]>>, id: string) => {
    setFn(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // Filtrado y ordenado en memoria
  const filteredVideos = useMemo(() => {
    let result = [...videos]

    if (activeTimes.length > 0) {
      const maxAllowed = Math.max(...activeTimes.map(id => timeFilters.find(t => t.id === id)?.maxSeconds || 0))
      result = result.filter(v => (v.duration_seconds || 0) <= maxAllowed)
    }

    if (activeCategories.length > 0) {
      result = result.filter(v => activeCategories.includes(v.category))
    }

    if (activePriorities.length > 0) {
      result = result.filter(v => activePriorities.includes(v.priority || ''))
    }

    if (activeTags.length > 0) {
      result = result.filter(v => activeTags.every(tagId => (v.tags || []).includes(tagId)))
    }

    const priorityWeight: Record<string, number> = { 'none': 0 }
    priorities.forEach(p => { priorityWeight[p.id] = p.level })
    
    result.sort((a, b) => {
      const pA = priorityWeight[a.priority || 'none'] || 0
      const pB = priorityWeight[b.priority || 'none'] || 0
      if (pA !== pB) return pB - pA // High first
      
      const dateA = new Date(a.saved_at || 0).getTime()
      const dateB = new Date(b.saved_at || 0).getTime()
      return dateA - dateB // Oldest first
    })

    return result
  }, [videos, activeTimes, activeCategories, activePriorities, activeTags])

  const handleAction = async (id: string, action: 'seen' | 'discard' | 'notion' | 'custom') => {
    if (action === 'seen' || action === 'discard') {
      updateVideo(id, { status: action === 'seen' ? 'seen' : 'discarded' })
    } else if (action === 'notion') {
      updateVideo(id, { notion_status: 'candidate' })
      alert("Enviado a Notion")
    }
  }

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>

  const hasFilters = activeTimes.length > 0 || activeCategories.length > 0 || activePriorities.length > 0 || activeTags.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros */}
      <section className="space-y-4">
        {/* Tiempo */}
        <div className="space-y-2">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted ml-1">Tiempo</label>
          <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar -mx-4 px-4">
            {timeFilters.map(f => (
              <button 
                key={f.id}
                onClick={() => toggleFilter(setActiveTimes, f.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  activeTimes.includes(f.id)
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-surface-low text-onSurface-muted border-surface-high hover:text-onSurface'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted ml-1">Categoría</label>
          <div className="flex flex-wrap gap-2 pb-1 -mx-4 px-4">
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => toggleFilter(setActiveCategories, cat.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  activeCategories.includes(cat.id)
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-surface-low text-onSurface-muted border-surface-high hover:text-onSurface'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Prioridad */}
        <div className="space-y-2">
          <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted ml-1">Prioridad</label>
          <div className="flex gap-2 px-1">
            {priorities.map(p => (
              <button 
                key={p.id}
                onClick={() => toggleFilter(setActivePriorities, p.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  activePriorities.includes(p.id)
                    ? 'bg-primary/20 text-primary border-primary/50'
                    : 'bg-surface-low text-onSurface-muted border-surface-high hover:text-onSurface'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.colorHex }} />
                <span style={{ color: activePriorities.includes(p.id) ? 'inherit' : p.colorHex }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Etiquetas */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted ml-1">Etiquetas</label>
            <div className="flex flex-wrap gap-2 pb-1 -mx-4 px-4">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleFilter(setActiveTags, tag.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    activeTags.includes(tag.id)
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-surface-low text-onSurface-muted border-surface-high hover:text-onSurface'
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Lista de resultados */}
      <section>
        <div className="flex flex-col gap-2 mt-2">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12 px-4 bg-surface-low border border-surface-high rounded-xl mt-4">
              <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">
                {hasFilters ? 'filter_list_off' : 'celebration'}
              </span>
              <p className="text-sm text-onSurface-muted">
                {hasFilters 
                  ? "No hay vídeos que coincidan con los filtros seleccionados."
                  : "No tienes vídeos pendientes. ¡Buen trabajo!"}
              </p>
            </div>
          ) : (
            filteredVideos.map(video => (
              <VideoRow
                key={video.id}
                id={video.id}
                title={video.title}
                channel={video.channel_name || 'Desconocido'}
                thumbnailUrl={video.thumbnail_url || undefined}
                durationFormatted={formatDuration(video.duration_seconds)}
                publishedAt={video.published_at}
                priorityId={video.priority}
                tags={video.tags}
                onAction={(action) => handleAction(video.id, action)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default function WatchNowView() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <WatchNowContent />
    </Suspense>
  )
}
