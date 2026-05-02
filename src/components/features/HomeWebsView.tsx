"use client"

import Link from "next/link"
import { useAppStore } from "@/store/useAppStore"
import { useEffect, useState, useMemo } from "react"
import WebLinkRow from "@/components/ui/WebLinkRow"
import { useRouter } from "next/navigation"

export default function HomeWebsView() {
  const webLinks = useAppStore(state => state.webLinks)
  const categories = useAppStore(state => state.categories)
  const priorities = useAppStore(state => state.priorities)
  const tags = useAppStore(state => state.tags)
  const actions = useAppStore(state => state.actions)
  
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [homeView, setHomeView] = useState<'collections' | 'tags' | 'priorities'>('collections')
  const updateWebLink = useAppStore(state => state.updateWebLink)
  const router = useRouter()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Búsqueda Global
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return webLinks.filter(w => {
      if (w.status !== 'pending') return false;
      
      const matchesTitle = w.title.toLowerCase().includes(query)
      const matchesUrl = w.url.toLowerCase().includes(query)
      
      const linkTags = tags.filter(t => (w.tags || []).includes(t.id))
      const matchesTag = linkTags.some(t => t.name.toLowerCase().includes(query))
      
      return matchesTitle || matchesUrl || matchesTag
    })
  }, [webLinks, searchQuery, tags])

  if (!mounted) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  const pendingLinks = webLinks.filter(w => w.status === 'pending')
  const unclassifiedCount = pendingLinks.filter(w => w.category === 'Sin clasificar').length
  const notionCount = webLinks.filter(w => w.notion_status === 'candidate' || w.notion_status === 'prepared').length
  const seenCount = webLinks.filter(w => w.status === 'seen').length

  // Tags view
  const tagsWithCounts = tags
    .map(tag => ({
      ...tag,
      count: pendingLinks.filter(w => (w.tags || []).includes(tag.id)).length
    }))
    .filter(t => t.count > 0)

  // Priority view
  const prioritiesWithCounts = priorities
    .map(p => ({
      ...p,
      count: pendingLinks.filter(w => w.priority === p.id).length
    }))
    .filter(p => p.count > 0)
    .sort((a, b) => b.level - a.level)

  // Collections view
  const categoriesWithCounts = categories.map(cat => {
    const catLinks = pendingLinks.filter(w => w.category === cat.id)
    const hasHighPriority = catLinks.some(w => {
      const prio = priorities.find(p => p.id === w.priority)
      return prio ? prio.level >= 3 : false
    })
    return {
      ...cat,
      count: catLinks.length,
      hasHighPriority
    }
  }).filter(cat => cat.count > 0).sort((a, b) => {
    if (a.hasHighPriority && !b.hasHighPriority) return -1
    if (!a.hasHighPriority && b.hasHighPriority) return 1
    return b.count - a.count 
  })

  const handleAction = async (id: string, action: 'seen' | 'discard' | 'notion' | 'custom') => {
    if (action === 'seen' || action === 'discard') {
      updateWebLink(id, { status: action === 'seen' ? 'seen' : 'discarded' })
    } else if (action === 'notion') {
      updateWebLink(id, { notion_status: 'candidate' })
      alert("Enviado a Notion")
    } else if (action === 'custom') {
      router.push(`/actions?addForWebLink=${id}`)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative mb-2">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-onSurface-muted text-xl">search</span>
        <input 
          type="text" 
          placeholder="Buscar webs o temas..." 
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
              <p className="text-sm text-onSurface-muted">No se encontraron enlaces web.</p>
            </div>
          ) : (
            searchResults.map(link => (
              <WebLinkRow
                key={link.id}
                id={link.id}
                title={link.title}
                url={link.url}
                priorityId={link.priority}
                status={link.status}
                tags={link.tags}
                onAction={(action) => handleAction(link.id, action)}
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
            {webLinks.length === 0 ? (
              <div className="text-center py-10 bg-surface-low rounded-xl border border-surface-high">
                <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">language</span>
                <p className="text-sm text-onSurface-muted">No tienes enlaces web guardados aún.</p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-add-web'))}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Añadir enlace web
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categoriesWithCounts.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}?type=webs`}
                    className={`bg-surface-low rounded-2xl p-4 flex flex-col justify-between items-start gap-3 hover:bg-surface-high transition-colors group border border-surface-high min-h-[100px] ${cat.count === 0 ? 'opacity-50' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-high flex items-center justify-center flex-shrink-0" style={{ color: cat.colorHex }}>
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    </div>
                    <div className="w-full">
                      <h3 className="text-sm font-semibold text-onSurface group-hover:text-primary transition-colors leading-tight">{cat.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] uppercase tracking-wider text-onSurface-muted">{cat.count} {cat.count === 1 ? 'web' : 'webs'}</p>
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
                <p className="text-sm text-onSurface-muted">Ningún enlace tiene etiquetas asignadas todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {tagsWithCounts.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.id}?type=webs`}
                    className="bg-surface-low rounded-2xl p-4 flex flex-col justify-between items-start gap-3 hover:bg-surface-high transition-colors group border border-surface-high min-h-[100px]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface-high flex items-center justify-center flex-shrink-0 text-primary">
                      <span className="material-symbols-outlined text-[20px]">tag</span>
                    </div>
                    <div className="w-full">
                      <h3 className="text-sm font-semibold text-onSurface group-hover:text-primary transition-colors leading-tight">#{tag.name}</h3>
                      <p className="text-[10px] uppercase tracking-wider text-onSurface-muted mt-1">{tag.count} {tag.count === 1 ? 'web' : 'webs'}</p>
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
                <p className="text-sm text-onSurface-muted">Ningún enlace web tiene prioridad asignada todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {prioritiesWithCounts.map(prio => (
                  <Link
                    key={prio.id}
                    href={`/watch?priority=${prio.id}&type=webs`}
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
                      <p className="text-[10px] uppercase tracking-wider text-onSurface-muted mt-1">{prio.count} {prio.count === 1 ? 'web' : 'webs'}</p>
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
              
              {/* Sin clasificar */}
              <Link href="/category/Sin clasificar?type=webs" className={`bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px] ${unclassifiedCount === 0 ? 'opacity-50' : ''}`}>
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
              <Link href="/trash?type=webs" className="bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-start mb-3">
                  <span className="material-symbols-outlined text-error">delete</span>
                  {webLinks.filter(w => w.status === 'discarded').length > 0 && (
                    <div className="bg-error/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-error font-medium">
                      {webLinks.filter(w => w.status === 'discarded').length}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-onSurface">Papelera</h2>
                  <p className="text-[10px] uppercase tracking-wider text-error font-medium mt-1">Webs descartadas</p>
                </div>
              </Link>

              {/* Histórico / Vistos */}
              <Link href="/history?type=webs" className="bg-surface-low rounded-xl p-4 relative overflow-hidden group hover:bg-surface-high transition-colors border border-surface-high flex flex-col justify-between min-h-[110px]">
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
    </div>
  )
}
