"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import VideoRow from "@/components/ui/VideoRow"
import { useAppStore } from "@/store/useAppStore"

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds === 0) return ""
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function TagVideoList({ tagId }: { tagId: string }) {
  const allVideos = useAppStore(state => state.videos)
  const tags = useAppStore(state => state.tags)
  const updateVideo = useAppStore(state => state.updateVideo)
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const tag = tags.find(t => t.id === tagId)
  const videos = allVideos.filter(v => v.status === 'pending' && (v.tags || []).includes(tagId))

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

  if (!mounted) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-[20px]">tag</span>
        <h1 className="text-xl font-bold tracking-tight text-onSurface truncate">
          {tag?.name || tagId}
        </h1>
        <span className="text-xs text-onSurface-muted">· {videos.length} vídeo{videos.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Videos */}
      {videos.length === 0 ? (
        <div className="text-center py-12 px-4">
          <span className="material-symbols-outlined text-5xl text-surface-high mb-3">label_off</span>
          <p className="text-sm text-onSurface-muted">No hay vídeos pendientes con esta etiqueta.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {videos.map(video => (
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
          ))}
        </div>
      )}
    </div>
  )
}
