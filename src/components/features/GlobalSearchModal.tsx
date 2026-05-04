"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"

type SearchResult = {
  id: string
  type: 'video' | 'web' | 'action'
  title: string
  subtitle: string
  href: string
  icon: string
}

export default function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const videos = useAppStore(state => state.videos)
  const webLinks = useAppStore(state => state.webLinks)
  const actions = useAppStore(state => state.actions)

  // Listen for open event dispatched from header button
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-global-search', handleOpen)
    return () => window.removeEventListener('open-global-search', handleOpen)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
    }
  }, [isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const q = query.toLowerCase().trim()

  const results: SearchResult[] = q.length < 2 ? [] : [
    ...videos
      .filter(v => 
        v.title.toLowerCase().includes(q) ||
        (v.channel_name?.toLowerCase().includes(q)) ||
        (v.personal_notes?.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        type: 'video' as const,
        title: v.title,
        subtitle: v.channel_name || v.category,
        href: `/video/${v.id}`,
        icon: 'video_library'
      })),
    ...webLinks
      .filter(w =>
        w.title.toLowerCase().includes(q) ||
        w.url.toLowerCase().includes(q) ||
        (w.personal_notes?.toLowerCase().includes(q))
      )
      .slice(0, 5)
      .map(w => ({
        id: w.id,
        type: 'web' as const,
        title: w.title,
        subtitle: new URL(w.url).hostname.replace('www.', ''),
        href: `/webs/${w.id}`,
        icon: 'language'
      })),
    ...actions
      .filter(a => a.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({
        id: a.id,
        type: 'action' as const,
        title: a.title,
        subtitle: a.status === 'completed' ? 'Completada' : 'Pendiente',
        href: '/actions',
        icon: 'check_circle'
      }))
  ]

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
      <div className="fixed inset-x-0 top-0 z-50 flex justify-center pt-4 px-4">
        <div
          ref={modalRef}
          className="w-full max-w-lg bg-surface-low rounded-2xl shadow-[0px_16px_48px_rgba(0,0,0,0.6)] border border-surface-high overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-high">
            <span className="material-symbols-outlined text-[20px] text-onSurface-muted">search</span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar vídeos, webs, acciones..."
              className="flex-1 bg-transparent text-onSurface text-sm focus:outline-none placeholder:text-onSurface-muted"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-onSurface-muted hover:text-onSurface">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-[10px] text-onSurface-muted border border-surface-high rounded px-1.5 py-0.5 hover:bg-surface-high"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          {q.length >= 2 && (
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
              {results.length === 0 ? (
                <div className="py-8 text-center text-onSurface-muted text-sm">
                  <span className="material-symbols-outlined text-[32px] block mb-2">search_off</span>
                  No se encontraron resultados para "{query}"
                </div>
              ) : (
                <div className="py-2">
                  {/* Group by type */}
                  {(['video', 'web', 'action'] as const).map(type => {
                    const typeResults = results.filter(r => r.type === type)
                    if (typeResults.length === 0) return null
                    const labels = { video: 'Vídeos', web: 'Webs', action: 'Acciones' }
                    return (
                      <div key={type}>
                        <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-onSurface-muted/60">
                          {labels[type]}
                        </p>
                        {typeResults.map(result => (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-high transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-[16px] text-primary">{result.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-onSurface font-medium truncate">{result.title}</p>
                              <p className="text-[11px] text-onSurface-muted truncate">{result.subtitle}</p>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-onSurface-muted flex-shrink-0">chevron_right</span>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {q.length < 2 && (
            <div className="py-6 text-center text-onSurface-muted text-xs">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      </div>
    </>
  )
}
