"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/store/useAppStore"

export default function AddVideoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [metadata, setMetadata] = useState<{
    videoId: string;
    title: string;
    channel: string;
    thumbnailUrl: string;
    durationSeconds: number;
    publishedAt: string | null;
  } | null>(null)
  
  const [fetchFailed, setFetchFailed] = useState(false)
  const [duplicateError, setDuplicateError] = useState<{ categoryName: string } | null>(null)
  const [manualTitle, setManualTitle] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // States for creating new items
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  
  const categories = useAppStore(state => state.categories)
  const priorities = useAppStore(state => state.priorities)
  const tags = useAppStore(state => state.tags)
  const addVideo = useAppStore(state => state.addVideo)
  const addCategory = useAppStore(state => state.addCategory)
  const addTag = useAppStore(state => state.addTag)

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true)
      if (e?.detail?.url) {
        setUrl(e.detail.url)
      }
    }
    window.addEventListener('open-add-video', handleOpen)
    return () => window.removeEventListener('open-add-video', handleOpen)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal()
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const closeModal = () => {
    setIsOpen(false)
    setTimeout(() => {
      setUrl("")
      setMetadata(null)
      setFetchFailed(false)
      setDuplicateError(null)
      setManualTitle("")
      setCategory(null)
      setPriority(null)
      setSelectedTags([])
      setIsAddingCategory(false)
      setNewCategoryName("")
      setIsAddingTag(false)
      setNewTagName("")
    }, 300) // wait for animation
  }

  // Handle URL Paste/Input
  useEffect(() => {
    if (!url) {
      setMetadata(null)
      setFetchFailed(false)
      setDuplicateError(null)
      return
    }

    setDuplicateError(null)

    const fetchMetadata = async () => {
      setLoadingMetadata(true)
      setFetchFailed(false)
      setMetadata(null)
      
      try {
        const res = await fetch(`/api/youtube?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        
        if (res.ok) {
          setMetadata(data)
        } else {
          setFetchFailed(true)
          if (data.partialData) {
             // Fallback for ID and thumbnail even if API fails
             setMetadata(data.partialData)
          }
        }
      } catch (e) {
        setFetchFailed(true)
      } finally {
        setLoadingMetadata(false)
      }
    }

    const timer = setTimeout(() => {
      fetchMetadata()
    }, 500)

    return () => clearTimeout(timer)
  }, [url])

  useEffect(() => {
    if (!url) return;
    const allVideos = useAppStore.getState().videos;
    const existingVideo = allVideos.find(v => v.url === url || (metadata?.videoId && v.youtube_video_id === metadata.videoId));
    if (existingVideo) {
      const catName = categories.find(c => c.id === existingVideo.category)?.name || existingVideo.category;
      setDuplicateError({ categoryName: catName });
    }
  }, [url, metadata, categories])

  const handleSave = async () => {
    if (!url || duplicateError) return

    setSaving(true)
    
    const titleToSave = metadata?.title || manualTitle || url
    
    const videoData = {
      url,
      youtube_video_id: metadata?.videoId || null,
      title: titleToSave,
      channel_name: metadata?.channel || null,
      thumbnail_url: metadata?.thumbnailUrl || null,
      duration_seconds: metadata?.durationSeconds || null,
      published_at: metadata?.publishedAt || null,
      category: category || 'Sin clasificar',
      priority,
      status: 'pending' as const,
      notion_status: 'none' as const,
      tags: selectedTags
    }

    // Save locally via Zustand
    addVideo(videoData)
    
    router.refresh()
    closeModal()
    setSaving(false)
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    const id = newCategoryName.trim()
    // Check if already exists
    if (!categories.find(c => c.id === id)) {
      addCategory({
        id,
        name: newCategoryName.trim(),
        icon: 'folder',
        colorHex: '#9CA3AF'
      })
    }
    setCategory(id)
    setNewCategoryName("")
    setIsAddingCategory(false)
  }

  const handleAddTag = () => {
    if (!newTagName.trim()) return
    const id = newTagName.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tags.find(t => t.id === id)) {
      addTag({
        id,
        name: newTagName.trim()
      })
    }
    if (!selectedTags.includes(id)) {
      setSelectedTags(prev => [...prev, id])
    }
    setNewTagName("")
    setIsAddingTag(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Dim overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity" />
      
      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 h-[75vh] bg-surface-low z-50 rounded-t-3xl flex flex-col shadow-[0px_-12px_32px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-300" ref={modalRef}>
        
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-surface-high rounded-full" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6 no-scrollbar">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-onSurface">Añadir vídeo</h2>
            <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-high transition-colors text-onSurface-muted">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>

          {/* URL Input */}
          <section className="space-y-3">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onSurface-muted group-focus-within:text-primary transition-colors text-[20px]">link</span>
              <input 
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                placeholder="Pega la URL de YouTube" 
                className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-onSurface-muted"
              />
            </div>
          </section>

          {/* Loading State */}
          {loadingMetadata && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error State / Manual Input */}
          {fetchFailed && !loadingMetadata && !duplicateError && (
            <div className="space-y-3 bg-surface-high/50 p-4 rounded-lg">
              <p className="text-xs text-error">No se pudieron obtener los datos automáticamente. Introduce el título manualmente.</p>
              <input 
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Título del vídeo" 
                className="w-full bg-background border border-surface-high text-onSurface text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-all placeholder:text-onSurface-muted"
              />
            </div>
          )}

          {/* Duplicate Error Alert */}
          {duplicateError && (
            <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-error">warning</span>
              <div>
                <h4 className="text-sm font-semibold text-error">Vídeo duplicado</h4>
                <p className="text-xs text-error/80 mt-1">Este vídeo ya lo tienes guardado en la categoría <span className="font-bold">{duplicateError.categoryName}</span>.</p>
              </div>
            </div>
          )}

          {/* Success Preview */}
          {metadata && !loadingMetadata && !fetchFailed && !duplicateError && metadata.title && (
            <section className="bg-background border border-surface-high rounded-lg p-3 flex items-start gap-3">
              <div className="w-16 h-12 bg-surface-high rounded flex-shrink-0 relative overflow-hidden">
                <Image src={metadata.thumbnailUrl} alt={metadata.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-status-notion truncate">{metadata.title}</h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  <p className="text-[10px] uppercase tracking-wider text-onSurface-muted flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">smart_display</span> {metadata.channel}
                  </p>
                  {metadata.durationSeconds > 0 && (
                    <p className="text-[10px] uppercase tracking-wider text-onSurface-muted flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> 
                      {Math.floor(metadata.durationSeconds / 60)}:{(metadata.durationSeconds % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                  {metadata.publishedAt && (
                    <p className="text-[10px] uppercase tracking-wider text-onSurface-muted flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                      {new Date(metadata.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Categories */}
          <section className="space-y-3">
            <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all border ${
                    category === cat.id 
                      ? 'bg-gradient-to-br from-[#7C5CFC] to-[#947DFF] text-white border-transparent shadow-[0_2px_8px_rgba(124,92,252,0.3)]' 
                      : 'bg-surface-high text-onSurface-muted border-surface-high hover:text-onSurface'
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              {isAddingCategory ? (
                <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                  <input 
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    placeholder="Nombre..."
                    autoFocus
                    className="bg-background border border-primary/40 text-onSurface text-xs rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/20 w-24"
                  />
                  <button onClick={handleAddCategory} className="text-primary hover:text-primary/80">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  </button>
                  <button onClick={() => setIsAddingCategory(false)} className="text-onSurface-muted">
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-surface-high/50 text-primary border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Nueva</span>
                </button>
              )}
            </div>
          </section>

          {/* Priority */}
          <section className="space-y-3">
            <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setPriority(priority === p.id ? null : p.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors border ${
                    priority === p.id
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-surface-high border-surface-high hover:bg-surface-low'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.colorHex }}></div>
                  <span className={`text-sm ${priority === p.id ? 'text-primary font-medium' : 'text-onSurface-muted'}`}>{p.label}</span>
                </button>
              ))}
            </div>
          </section>

            <section className="space-y-3">
              <label className="block text-[10px] font-medium uppercase tracking-wider text-onSurface-muted">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button 
                    key={tag.id}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                      )
                    }}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-all border ${
                      selectedTags.includes(tag.id)
                        ? 'bg-primary/20 text-primary border-primary/40' 
                        : 'bg-surface-high/50 text-onSurface-muted border-surface-high hover:bg-surface-high'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}

                {isAddingTag ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <input 
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Tag..."
                      autoFocus
                      className="bg-background border border-primary/40 text-onSurface text-[10px] rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-primary/20 w-20"
                    />
                    <button onClick={handleAddTag} className="text-primary hover:text-primary/80">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                    <button onClick={() => setIsAddingTag(false)} className="text-onSurface-muted">
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAddingTag(true)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] bg-surface-high/50 text-primary border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Nueva</span>
                  </button>
                )}
              </div>
            </section>
        </div>

        {/* Footer Button */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-surface-low border-t border-surface-high pb-safe">
          <button 
            onClick={handleSave}
            disabled={!url || saving || !!duplicateError}
            className="w-full py-3.5 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#947DFF] text-white text-sm font-medium shadow-[0_4px_12px_rgba(124,92,252,0.3)] hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">save</span>
                Guardar
              </>
            )}
          </button>
        </div>
        
      </div>
    </>
  )
}
