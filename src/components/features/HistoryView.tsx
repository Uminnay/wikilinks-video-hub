"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAppStore } from "@/store/useAppStore"

export default function HistoryView({ type = 'videos' }: { type?: 'videos' | 'webs' }) {
  const allVideos = useAppStore(state => state.videos)
  const allWebs = useAppStore(state => state.webLinks)
  const updateVideo = useAppStore(state => state.updateVideo)
  const deleteVideo = useAppStore(state => state.deleteVideo)
  const updateWebLink = useAppStore(state => state.updateWebLink)
  const deleteWebLink = useAppStore(state => state.deleteWebLink)
  
  const [mounted, setMounted] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => setMounted(true), [])

  const seenVideos = allVideos.filter(v => v.status === 'seen')
  const seenWebs = allWebs.filter(w => w.status === 'seen')
  
  const itemsCount = type === 'videos' ? seenVideos.length : seenWebs.length

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const selectAll = () => {
    if (selectedIds.size === itemsCount) {
      setSelectedIds(new Set())
    } else {
      if (type === 'videos') {
        setSelectedIds(new Set(seenVideos.map(v => v.id)))
      } else {
        setSelectedIds(new Set(seenWebs.map(w => w.id)))
      }
    }
  }

  const handleRestoreSelected = () => {
    if (selectedIds.size === 0) return
    if (type === 'videos') {
      Array.from(selectedIds).forEach(id => updateVideo(id, { status: 'pending' }))
    } else {
      Array.from(selectedIds).forEach(id => updateWebLink(id, { status: 'pending' }))
    }
    setSelectedIds(new Set())
  }

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return
    if (type === 'videos') {
      Array.from(selectedIds).forEach(id => deleteVideo(id))
    } else {
      Array.from(selectedIds).forEach(id => deleteWebLink(id))
    }
    setSelectedIds(new Set())
  }

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>

  if (itemsCount === 0) {
    return (
      <div className="text-center py-12 px-4 bg-surface-low border border-surface-high rounded-xl mt-4">
        <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">history</span>
        <p className="text-sm text-onSurface-muted">Aún no hay {type === 'videos' ? 'vídeos' : 'webs'} en tu historial.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Batch Actions */}
      <div className="flex items-center justify-between bg-surface-low p-3 rounded-xl border border-surface-high sticky top-[72px] z-20">
        <button 
          onClick={selectAll}
          className="text-xs font-medium text-onSurface hover:text-primary transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            {selectedIds.size === itemsCount ? 'check_box' : 'check_box_outline_blank'}
          </span>
          {selectedIds.size === itemsCount ? 'Deseleccionar todo' : 'Seleccionar todo'}
        </button>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-onSurface-muted mr-2 hidden sm:inline">{selectedIds.size} seleccionados</span>
            <button 
              onClick={handleRestoreSelected}
              className="w-8 h-8 rounded-lg bg-surface-high text-primary hover:bg-primary/20 transition-colors flex items-center justify-center"
              title="Restaurar a pendientes"
            >
              <span className="material-symbols-outlined text-[16px]">restore</span>
            </button>
            <button 
              onClick={handleDeleteSelected}
              className="w-8 h-8 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center justify-center"
              title="Eliminar definitivamente"
            >
              <span className="material-symbols-outlined text-[16px]">delete_forever</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {type === 'videos' ? seenVideos.map(video => (
          <div 
            key={video.id} 
            onClick={() => toggleSelect(video.id)}
            className={`bg-surface-low rounded-xl border overflow-hidden flex flex-col md:flex-row cursor-pointer transition-colors ${
              selectedIds.has(video.id) ? 'border-primary bg-primary/5' : 'border-surface-high hover:border-surface-high/80'
            }`}
          >
            <div className="flex p-3 gap-3 flex-1 min-w-0 items-center">
              <span className={`material-symbols-outlined text-[20px] ${selectedIds.has(video.id) ? 'text-primary' : 'text-onSurface-muted'}`}>
                {selectedIds.has(video.id) ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div className="w-16 h-12 rounded bg-surface-high flex-shrink-0 relative overflow-hidden pointer-events-none">
                {video.thumbnail_url ? (
                  <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover opacity-70" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-onSurface-muted">
                    <span className="material-symbols-outlined">play_circle</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center pointer-events-none">
                <h3 className="text-sm font-sans font-medium text-onSurface line-clamp-1">{video.title}</h3>
                <span className="text-[11px] text-onSurface-muted truncate">{video.channel_name || 'Desconocido'}</span>
              </div>
            </div>
          </div>
        )) : seenWebs.map(link => (
          <div 
            key={link.id} 
            onClick={() => toggleSelect(link.id)}
            className={`bg-surface-low rounded-xl border overflow-hidden flex flex-col md:flex-row cursor-pointer transition-colors ${
              selectedIds.has(link.id) ? 'border-primary bg-primary/5' : 'border-surface-high hover:border-surface-high/80'
            }`}
          >
            <div className="flex p-3 gap-3 flex-1 min-w-0 items-center">
              <span className={`material-symbols-outlined text-[20px] ${selectedIds.has(link.id) ? 'text-primary' : 'text-onSurface-muted'}`}>
                {selectedIds.has(link.id) ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <div className="w-12 h-12 rounded bg-surface-high flex-shrink-0 flex items-center justify-center text-onSurface-muted pointer-events-none">
                <span className="material-symbols-outlined">language</span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center pointer-events-none">
                <h3 className="text-sm font-sans font-medium text-onSurface line-clamp-1">{link.title}</h3>
                <span className="text-[11px] text-onSurface-muted truncate">{link.url}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
