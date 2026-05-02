"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import VideoRow from "@/components/ui/VideoRow"
import WebLinkRow from "@/components/ui/WebLinkRow"
import { useAppStore } from "@/store/useAppStore"

// Simple date formatter
function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds === 0) return ""
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) return `${h}h ${m}m`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function CategoryVideoList({ categoryName, type = 'videos' }: { categoryName: string, type?: 'videos' | 'webs' }) {
  const allVideos = useAppStore(state => state.videos)
  const allWebs = useAppStore(state => state.webLinks)
  const updateVideo = useAppStore(state => state.updateVideo)
  const updateWebLink = useAppStore(state => state.updateWebLink)
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  const videos = allVideos.filter(v => v.category === categoryName && v.status === 'pending')
  const webs = allWebs.filter(w => w.category === categoryName && w.status === 'pending')
  const itemsCount = type === 'videos' ? videos.length : webs.length

  const handleAction = async (id: string, action: 'seen' | 'discard' | 'notion' | 'custom') => {
    if (type === 'videos') {
      if (action === 'seen' || action === 'discard') {
        updateVideo(id, { status: action === 'seen' ? 'seen' : 'discarded' })
      } else if (action === 'notion') {
        updateVideo(id, { notion_status: 'candidate' })
        alert("Enviado a Notion")
      } else if (action === 'custom') {
        router.push(`/actions?addForVideo=${id}`)
      }
    } else {
      if (action === 'seen' || action === 'discard') {
        updateWebLink(id, { status: action === 'seen' ? 'seen' : 'discarded' })
      } else if (action === 'notion') {
        updateWebLink(id, { notion_status: 'candidate' })
        alert("Enviado a Notion")
      } else if (action === 'custom') {
        router.push(`/actions?addForWebLink=${id}`)
      }
    }
  }

  if (!mounted) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  if (itemsCount === 0) {
    return (
      <div className="text-center py-12 px-4">
        <span className="material-symbols-outlined text-5xl text-surface-high mb-3">
          {type === 'videos' ? 'inbox' : 'public_off'}
        </span>
        <p className="text-sm text-onSurface-muted">Esta categoría está vacía en la sección de {type === 'videos' ? 'vídeos' : 'webs'}.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {type === 'videos' ? videos.map(video => (
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
      )) : webs.map(link => (
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
      ))}
    </div>
  )
}
