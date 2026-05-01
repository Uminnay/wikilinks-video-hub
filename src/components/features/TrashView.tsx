"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppStore } from "@/store/useAppStore"

export default function TrashView() {
  const allVideos = useAppStore(state => state.videos)
  const updateVideo = useAppStore(state => state.updateVideo)
  const deleteVideo = useAppStore(state => state.deleteVideo)
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const discardedVideos = allVideos.filter(v => v.status === 'discarded')

  const handleRestore = (id: string) => {
    updateVideo(id, { status: 'pending' })
  }

  const handleDelete = (id: string) => {
    deleteVideo(id)
  }

  const handleEmptyTrash = () => {
    discardedVideos.forEach(v => deleteVideo(v.id))
  }

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-error border-t-transparent rounded-full animate-spin"></div></div>

  if (discardedVideos.length === 0) {
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
        {discardedVideos.map(video => (
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
        ))}
      </div>
    </div>
  )
}
