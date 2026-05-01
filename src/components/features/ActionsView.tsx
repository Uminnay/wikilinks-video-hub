"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAppStore } from "@/store/useAppStore"

export default function ActionsView() {
  const allActions = useAppStore(state => state.actions)
  const allVideos = useAppStore(state => state.videos)
  const addAction = useAppStore(state => state.addAction)
  const updateAction = useAppStore(state => state.updateAction)
  
  const [mounted, setMounted] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [adding, setAdding] = useState(false)
  
  useEffect(() => setMounted(true), [])

  const handleToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending'
    updateAction(id, { status: newStatus })
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setAdding(true)
    addAction({
      title: newTaskTitle.trim(),
      status: 'pending'
    })
    setNewTaskTitle("")
    setAdding(false)
  }

  if (!mounted) return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>

  const pendingActions = allActions.filter(a => a.status === 'pending')
  const completedActions = allActions.filter(a => a.status === 'completed')

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Nueva acción..."
          className="flex-1 bg-surface-low border border-surface-high text-onSurface text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
        />
        <button 
          type="submit"
          disabled={adding || !newTaskTitle.trim()}
          className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:brightness-110 disabled:opacity-50 transition-all shadow-[0_4px_12px_rgba(124,92,252,0.3)]"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </form>

      {allActions.length === 0 ? (
        <div className="text-center py-12 px-4 bg-surface-low border border-surface-high rounded-xl">
          <span className="material-symbols-outlined text-4xl text-onSurface-muted mb-2">task</span>
          <p className="text-sm text-onSurface-muted">No tienes acciones pendientes.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h2 className="text-[10px] font-medium uppercase tracking-wider text-onSurface-muted ml-1">Pendientes ({pendingActions.length})</h2>
            <div className="flex flex-col gap-2">
              {pendingActions.map(action => {
                const relatedVideo = action.video_id ? allVideos.find(v => v.id === action.video_id) : null
                return (
                  <div key={action.id} className="bg-surface-low rounded-xl p-3 border border-surface-high flex items-start gap-3 group hover:border-primary/30 transition-colors">
                    <button 
                      onClick={() => handleToggle(action.id, action.status)}
                      className="w-6 h-6 rounded-full border-2 border-surface-high flex items-center justify-center mt-0.5 group-hover:border-primary transition-colors"
                    >
                      <div className="w-3 h-3 rounded-full bg-primary opacity-0 transition-opacity"></div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-onSurface">{action.title}</p>
                      {relatedVideo && (
                        <Link href={`/video/${action.video_id}`} className="mt-2 flex items-center gap-2 bg-surface-high/30 rounded-lg p-2 hover:bg-surface-high/60 transition-colors border border-surface-high/50 max-w-sm">
                          <div className="w-10 h-6 rounded bg-surface-high flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                            {relatedVideo.thumbnail_url ? (
                              <Image src={relatedVideo.thumbnail_url} alt={relatedVideo.title} fill className="object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-[12px] text-onSurface-muted">play_circle</span>
                            )}
                          </div>
                          <span className="text-xs text-onSurface-muted truncate flex-1">{relatedVideo.title}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {completedActions.length > 0 && (
            <div className="space-y-2 opacity-60">
              <h2 className="text-[10px] font-medium uppercase tracking-wider text-onSurface-muted ml-1">Completadas ({completedActions.length})</h2>
              <div className="flex flex-col gap-2">
                {completedActions.map(action => {
                  const relatedVideo = action.video_id ? allVideos.find(v => v.id === action.video_id) : null
                  return (
                    <div key={action.id} className="bg-surface-low/50 rounded-xl p-3 border border-surface-high/50 flex items-start gap-3">
                      <button 
                        onClick={() => handleToggle(action.id, action.status)}
                        className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex items-center justify-center mt-0.5"
                      >
                        <span className="material-symbols-outlined text-[14px] text-white">check</span>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-onSurface-muted line-through flex-1">{action.title}</p>
                        {relatedVideo && (
                          <Link href={`/video/${action.video_id}`} className="mt-2 flex items-center gap-2 bg-surface-high/20 rounded-lg p-2 hover:bg-surface-high/40 transition-colors border border-surface-high/30 max-w-sm">
                            <div className="w-10 h-6 rounded bg-surface-high flex-shrink-0 relative overflow-hidden flex items-center justify-center opacity-50">
                              {relatedVideo.thumbnail_url ? (
                                <Image src={relatedVideo.thumbnail_url} alt={relatedVideo.title} fill className="object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-[12px] text-onSurface-muted">play_circle</span>
                              )}
                            </div>
                            <span className="text-xs text-onSurface-muted truncate flex-1 opacity-70">{relatedVideo.title}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
