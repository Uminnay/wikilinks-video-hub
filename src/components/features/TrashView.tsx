"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppStore } from "@/store/useAppStore"

export default function TrashView({ type = 'videos' }: { type?: 'videos' | 'webs' }) {
  const allVideos = useAppStore(state => state.videos)
  const allWebs = useAppStore(state => state.webLinks)
  const updateVideo = useAppStore(state => state.updateVideo)
  const deleteVideo = useAppStore(state => state.deleteVideo)
  const updateWebLink = useAppStore(state => state.updateWebLink)
  const deleteWebLink = useAppStore(state => state.deleteWebLink)
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const discardedVideos = allVideos.filter(v => v.status === 'discarded')
  const discardedWebs = allWebs.filter(w => w.status === 'discarded')
  
  const itemsCount = type === 'videos' ? discardedVideos.length : discardedWebs.length

  const handleRestore = (id: string) => {
    if (type === 'videos') updateVideo(id, { status: 'pending' })
    else updateWebLink(id, { status: 'pending' })
  }

  const handleDelete = (id: string) => {
    if (type === 'videos') deleteVideo(id)
    else deleteWebLink(id)
  }

  const handleEmptyTrash = () => {
    if (type === 'videos') discardedVideos.forEach(v => deleteVideo(v.id))
    else discardedWebs.forEach(w => deleteWebLink(w.id))
  }

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-error border-t-transparent rounded-full animate-spin"></div></div>

  if (itemsCount === 0) {
    return (
      <div className="text-center py-12 px-4 bg-surface-low border border-surface-high rounded-xl mt-4">
        <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">delete_outline</span>
        <p className="text-sm text-onSurface-muted">La papelera está vacía.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button 
          onClick={handleEmptyTrash}
          className="text-xs font-medium text-error hover:text-error/80 hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
          Vaciar papelera
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {type === 'videos' ? discardedVideos.map(video => (
          <div key={video.id} className="bg-surface-low rounded-xl border border-surface-high overflow-hidden flex flex-col md:flex-row">
            <div className="flex p-3 gap-3 flex-1 min-w-0">
              <div className="w-16 h-12 rounded bg-surface-high flex-shrink-0 relative overflow-hidden">
                {video.thumbnail_url ? (
                  <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover opacity-50 grayscale" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-onSurface-muted">
                    <span className="material-symbols-outlined">play_circle</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-sm font-sans font-medium text-onSurface-muted line-clamp-1 line-through decoration-onSurface-muted/50">{video.title}</h3>
                <span className="text-[11px] text-onSurface-muted/70 truncate">{video.channel_name || 'Desconocido'}</span>
              </div>
            </div>
            
            <div className="flex border-t md:border-t-0 md:border-l border-surface-high">
              <button 
                onClick={() => handleRestore(video.id)}
                className="flex-1 px-4 py-3 bg-surface-low hover:bg-surface-high text-primary text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">restore</span>
                Restaurar
              </button>
              <button 
                onClick={() => handleDelete(video.id)}
                className="flex-1 px-4 py-3 bg-surface-low hover:bg-error/10 text-error text-xs font-medium transition-colors flex items-center justify-center gap-1 border-l border-surface-high"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                Eliminar
              </button>
            </div>
          </div>
        )) : discardedWebs.map(link => (
          <div key={link.id} className="bg-surface-low rounded-xl border border-surface-high overflow-hidden flex flex-col md:flex-row">
            <div className="flex p-3 gap-3 flex-1 min-w-0 items-center">
              <div className="w-12 h-12 rounded bg-surface-high flex-shrink-0 flex items-center justify-center text-onSurface-muted">
                <span className="material-symbols-outlined">language</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-sm font-sans font-medium text-onSurface-muted line-clamp-1 line-through decoration-onSurface-muted/50">{link.title}</h3>
                <span className="text-[11px] text-onSurface-muted/70 truncate">{link.url}</span>
              </div>
            </div>
            
            <div className="flex border-t md:border-t-0 md:border-l border-surface-high">
              <button 
                onClick={() => handleRestore(link.id)}
                className="flex-1 px-4 py-3 bg-surface-low hover:bg-surface-high text-primary text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">restore</span>
                Restaurar
              </button>
              <button 
                onClick={() => handleDelete(link.id)}
                className="flex-1 px-4 py-3 bg-surface-low hover:bg-error/10 text-error text-xs font-medium transition-colors flex items-center justify-center gap-1 border-l border-surface-high"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
