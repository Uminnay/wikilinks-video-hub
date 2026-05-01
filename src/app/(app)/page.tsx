"use client"

import Link from "next/link"
import AddFirstVideoBtn from "@/components/features/AddFirstVideoBtn"
import { useAppStore } from "@/store/useAppStore"
import { useEffect, useState, useMemo } from "react"
import VideoRow from "@/components/ui/VideoRow"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const videos = useAppStore(state => state.videos)
  const categories = useAppStore(state => state.categories)
  const priorities = useAppStore(state => state.priorities)
  const tags = useAppStore(state => state.tags)
  const actions = useAppStore(state => state.actions)
  const theme = useAppStore(state => state.theme)
  const toggleTheme = useAppStore(state => state.toggleTheme)
  
  // To avoid hydration mismatch due to Zustand persist reading from localStorage,
  // we only render the data after mounting.
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [homeView, setHomeView] = useState<'collections' | 'tags' | 'priorities'>('collections')
  const updateVideo = useAppStore(state => state.updateVideo)
  const router = useRouter()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Búsqueda Global
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return videos.filter(v => {
      if (v.status !== 'pending') return false;
      
      const matchesTitle = v.title.toLowerCase().includes(query)
      const matchesChannel = v.channel_name && v.channel_name.toLowerCase().includes(query)
      
      const videoTags = tags.filter(t => (v.tags || []).includes(t.id))
      const matchesTag = videoTags.some(t => t.name.toLowerCase().includes(query))
      
      return matchesTitle || matchesChannel || matchesTag
    })
  }, [videos, searchQuery])

  if (!mounted) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  const pendingVideos = videos.filter(v => v.status === 'pending')
  const unclassifiedCount = pendingVideos.filter(v => v.category === 'Sin clasificar').length
  const notionCount = videos.filter(v => v.notion_status === 'candidate' || v.notion_status === 'prepared').length
  const seenCount = videos.filter(v => v.status === 'seen').length

  // Tags view: for each tag, count pending videos that have it assigned
  const tagsWithCounts = tags
    .map(tag => ({
      ...tag,
      count: pendingVideos.filter(v => (v.tags || []).includes(tag.id)).length
    }))
    .filter(t => t.count > 0)

  // Priority view: for each priority, count pending videos
  const prioritiesWithCounts = priorities
    .map(p => ({
      ...p,
      count: pendingVideos.filter(v => v.priority === p.id).length
    }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.level - a.level)

  const categoriesWithCounts = categories.map(cat => {
    const catVideos = pendingVideos.filter(v => v.category === cat.id)
    const hasHighPriority = catVideos.some(v => {
      const prio = priorities.find(p => p.id === v.priority)
      return prio ? prio.level >= 3 : false
    })
    return {
      ...cat,
      count: catVideos.length,
      hasHighPriority
    }
  }).filter(cat => cat.count > 0).sort((a, b) => {
    if (a.hasHighPriority && !b.hasHighPriority) return -1
    if (!a.hasHighPriority && b.hasHighPriority) return 1
    return b.count - a.count 
  })

  // Formatear duración
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return ""
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleAction = async (id: string, action: 'seen' | 'discard' | 'notion' | 'custom') => {
    if (action === 'seen' || action === 'discard') {
      updateVideo(id, { status: action === 'seen' ? 'seen' : 'discarded' })
    } else if (action === 'notion') {
      updateVideo(id, { notion_status: 'candidate' })
      alert("Enviado a Notion")
    } else if (action === 'custom') {
      router.push(`/actions?addForVideo=${id}`)
    }
  }

  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="flex justify-between items-center w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center overflow-hidden border border-surface-high hover:brightness-110 transition-all">
            <span className="material-symbols-outlined text-onSurface-muted">person</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tighter text-primary">Wikilinks</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high transition-colors text-onSurface"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high transition-colors text-onSurface">
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </header>

      <div className="relative mb-2">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-onSurface-muted text-xl">search</span>
        <input 
          type="text" 
          placeholder="Buscar vídeos o canales..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-low border border-surface-high text-onSurface text-sm rounded-full pl-12 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-onSurface-muted hover:text-onSurface flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {searchQuery.trim() ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-[10px] font-sans font-medium uppercase tracking-wider text-onSurface-muted mb-2 ml-1">Resultados de búsqueda</h2>
          {searchResults.length === 0 ? (
            <div className="text-center py-10 bg-surface-low rounded-xl border border-surface-high">
              <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">search_off</span>
              <p className="text-sm text-onSurface-muted">No se encontraron vídeos.</p>
            </div>
          ) : (
            searchResults.map(video => (
              <VideoRow
                key={video.id}
                id={video.id}
                title={video.title}
                channel={video.channel_name || 'Desconocido'}
                thumbnailUrl={video.thumbnail_url || undefined}
                durationFormatted={formatDuration(video.duration_seconds)}
                publishedAt={video.published_at}
                priorityId={video.priority}
                status={video.status}
                tags={video.tags}
                onAction={(action) => handleAction(video.id, action)}
              />
            ))
          )}
        </section>
      ) : (
        <>
          {/* Toggle Colecciones / Etiquetas / Prioridad */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setHomeView('collections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                homeView === 'collections'
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'bg-surface-low text-onSurface-muted border-surface-high hover:text-onSurface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">grid_view</span>
              Colecciones
            </button>
            <button
              onClick={() => setHomeView('tags')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                homeView === 'tags'
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'bg-surface-low text-onSurface-muted border-surface-high hover:text-onSurface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">tag</span>
              Etiquetas
            </button>
            <button
              onClick={() => setHomeView('priorities')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                homeView === 'priorities'
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'bg-surface-low text-onSurface-muted border-surface-high hover:text-onSurface'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">flag</span>
              Prioridad
            </button>
          </div>

          {/* Vista Colecciones */}
          {homeView === 'collections' && (
          <section>
            <h2 className="text-[10px] font-sans font-medium uppercase tracking-wider text-onSurface-muted mb-4 ml-1">Colecciones</h2>
            {videos.length === 0 ? (
              <div className="text-center py-10 bg-surface-low rounded-xl border border-surface-high">
                <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">video_library</span>
                <p className="text-sm text-onSurface-muted">No tienes vídeos guardados aún.</p>
                <AddFirstVideoBtn />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categoriesWithCounts.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className={`bg-surface-low rounded-2xl p-4 flex flex-col justify-between items-start gap-3 hover:bg-surface-high transition-colors group border border-surface-high min-h-[100px] ${cat.count === 0 ? 'opacity-50' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-high flex items-center justify-center flex-shrink-0" style={{ color: cat.colorHex }}>
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    </div>
                    <div className="w-full">
                      <h3 className="text-sm font-semibold text-onSurface group-hover:text-primary transition-colors leading-tight">{cat.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] uppercase tracking-wider text-onSurface-muted">{cat.count} {cat.count === 1 ? 'vídeo' : 'vídeos'}</p>
                        {cat.hasHighPriority && (
                          <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: '#F59E0B' }}></div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          )}

          {/* Vista Etiquetas */}
          {homeView === 'tags' && (
          <section>
            <h2 className="text-[10px] font-sans font-medium uppercase tracking-wider text-onSurface-muted mb-4 ml-1">Por Etiqueta</h2>
            {tagsWithCounts.length === 0 ? (
              <div className="text-center py-10 bg-surface-low rounded-xl border border-surface-high">
                <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">label_off</span>
                <p className="text-sm text-onSurface-muted">Ningún vídeo tiene etiquetas asignadas todavía.</p>
                <p className="text-xs text-onSurface-muted mt-1">Crea etiquetas en Configuración y asígnalas a tus vídeos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {tagsWithCounts.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.id}`}
                    className="bg-surface-low rounded-2xl p-4 flex flex-col justify-between items-start gap-3 hover:bg-surface-high transition-colors group border border-surface-high min-h-[100px]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-high flex items-center justify-center flex-shrink-0 text-primary">
                      <span className="material-symbols-outlined text-[20px]">tag</span>
                    </div>
                    <div className="w-full">
                      <h3 className="text-sm font-semibold text-onSurface group-hover:text-primary transition-colors leading-tight">#{tag.name}</h3>
                      <p className="text-[10px] uppercase tracking-wider text-onSurface-muted mt-1">{tag.count} {tag.count === 1 ? 'vídeo' : 'vídeos'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          )}

          {/* Vista Prioridad */}
          {homeView === 'priorities' && (
          <section>
            <h2 className="text-[10px] font-sans font-medium uppercase tracking-wider text-onSurface-muted mb-4 ml-1">Por Prioridad</h2>
            {prioritiesWithCounts.length === 0 ? (
              <div className="text-center py-10 bg-surface-low rounded-xl border border-surface-high">
                <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">flag</span>
                <p className="text-sm text-onSurface-muted">Ningún vídeo tiene prioridad asignada todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {prioritiesWithCounts.map(prio => (
                  <Link
                    key={prio.id}
                    href={`/watch?priority=${prio.id}`}
                    className="bg-surface-low rounded-2xl p-4 flex flex-col justify-between items-start gap-3 hover:bg-surface-high transition-colors group border border-surface-high min-h-[100px]"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${prio.colorHex}22`, border: `1px solid ${prio.colorHex}55` }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: prio.colorHex, boxShadow: `0 0 8px ${prio.colorHex}88` }}
                      />
                    </div>
                    <div className="w-full">
                      <h3 className="text-sm font-semibold text-onSurface group-hover:text-primary transition-colors leading-tight">{prio.label}</h3>
                      <p className="text-[10px] uppercase tracking-wider text-onSurface-muted mt-1">{prio.count} {prio.count === 1 ? 'vídeo' : 'vídeos'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          )}

      {/* Alertas y Utilidades */}
      <section>
        <h2 className="text-[10px] font-sans font-medium uppercase tracking-wider text-onSurface-muted mb-4 ml-1">Herramientas y Tareas</h2>
        <div className="grid grid-cols-2 gap-3">
          
          {/* Notion */}
          <Link href="/notion" className="bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start mb-3">
              <span className="material-symbols-outlined text-status-notion">description</span>
              {notionCount > 0 && (
                <div className="bg-status-notion/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-status-notion font-medium">
                  {notionCount}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-onSurface">Notion</h2>
              <p className="text-[10px] uppercase tracking-wider text-status-notion font-medium mt-1">Exportación</p>
            </div>
          </Link>

          {/* Acciones */}
          <Link href="/actions" className="bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start mb-3">
              <span className="material-symbols-outlined text-primary">bolt</span>
              {actions.filter(a => a.status === 'pending').length > 0 && (
                <div className="bg-primary/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-primary font-medium">
                  {actions.filter(a => a.status === 'pending').length}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-onSurface">Acciones</h2>
              <p className="text-[10px] uppercase tracking-wider text-primary font-medium mt-1">Tareas pendientes</p>
            </div>
          </Link>

          {/* Sin clasificar */}
          <Link href="/category/Sin clasificar" className={`bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px] ${unclassifiedCount === 0 ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <span className="material-symbols-outlined text-onSurface-muted">folder_off</span>
              {unclassifiedCount > 0 && (
                <div className="bg-surface-high px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-onSurface font-medium">
                  {unclassifiedCount}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-onSurface">Sin clasificar</h2>
              <p className="text-[10px] uppercase tracking-wider text-priority-high font-medium mt-1">Requiere acción</p>
            </div>
          </Link>

          {/* Papelera */}
          <Link href="/trash" className="bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start mb-3">
              <span className="material-symbols-outlined text-error">delete</span>
              {videos.filter(v => v.status === 'discarded').length > 0 && (
                <div className="bg-error/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-error font-medium">
                  {videos.filter(v => v.status === 'discarded').length}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-onSurface">Papelera</h2>
              <p className="text-[10px] uppercase tracking-wider text-error font-medium mt-1">Vídeos descartados</p>
            </div>
          </Link>

          {/* Histórico / Vistos */}
          <Link href="/history" className="bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-start mb-3">
              <span className="material-symbols-outlined text-onSurface-muted">history</span>
              {seenCount > 0 && (
                <div className="bg-surface-high px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-onSurface font-medium">
                  {seenCount}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-onSurface">Vistos</h2>
              <p className="text-[10px] uppercase tracking-wider text-onSurface-muted font-medium mt-1">Historial</p>
            </div>
          </Link>
          
        </div>
      </section>
      </>
      )}
    </main>
  )
}
