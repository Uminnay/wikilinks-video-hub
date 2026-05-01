"use client"

import { useState } from "react"
import { useSwipeable } from "react-swipeable"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import PriorityChip from "./PriorityChip"
import { useAppStore } from "@/store/useAppStore"

export interface VideoRowProps {
  id: string
  title: string
  channel: string
  thumbnailUrl?: string
  durationFormatted: string
  publishedAt?: string | null
  priorityId?: string | null
  status?: string
  tags?: string[]
  onAction?: (action: 'seen' | 'discard' | 'notion' | 'custom') => void
}

export default function VideoRow({
  id,
  title,
  channel,
  thumbnailUrl,
  durationFormatted,
  publishedAt,
  priorityId,
  status,
  tags,
  onAction
}: VideoRowProps) {
  const [swiped, setSwiped] = useState(false)
  const allTags = useAppStore(state => state.tags)

  const handlers = useSwipeable({
    onSwipedLeft: () => setSwiped(true),
    onSwipedRight: () => setSwiped(false),
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-low border border-surface-high group">
      {/* Background Actions (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end">
        <button onClick={() => { onAction?.('seen'); setSwiped(false); }} className="h-full px-4 bg-status-seen text-white flex flex-col justify-center items-center gap-1 active:brightness-90 transition-all">
          <span className="material-symbols-outlined text-[20px]">visibility</span>
          <span className="text-[10px] font-sans uppercase tracking-wider">Visto</span>
        </button>
        <button onClick={() => { onAction?.('discard'); setSwiped(false); }} className="h-full px-4 bg-error text-white flex flex-col justify-center items-center gap-1 active:brightness-90 transition-all">
          <span className="material-symbols-outlined text-[20px]">delete</span>
          <span className="text-[10px] font-sans uppercase tracking-wider">Descartar</span>
        </button>
        <button onClick={() => { onAction?.('notion'); setSwiped(false); }} className="h-full px-4 bg-status-notion text-white flex flex-col justify-center items-center gap-1 active:brightness-90 transition-all">
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="text-[10px] font-sans uppercase tracking-wider">Notion</span>
        </button>
        <button onClick={() => { onAction?.('custom'); setSwiped(false); }} className="h-full px-4 bg-primary text-white flex flex-col justify-center items-center gap-1 active:brightness-90 transition-all">
          <span className="material-symbols-outlined text-[20px]">bolt</span>
          <span className="text-[10px] font-sans uppercase tracking-wider">Acción</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div 
        {...handlers}
        className={cn(
          "relative bg-surface-low p-3 flex items-start gap-3 transition-transform duration-300 ease-out z-10",
          swiped ? "-translate-x-[260px]" : "translate-x-0"
        )}
      >
        <Link href={`/video/${id}`} className="absolute inset-0 z-0" aria-label={`Ver detalles de ${title}`} />
        
        <div className="w-12 h-12 rounded bg-surface-high flex-shrink-0 relative overflow-hidden z-10 pointer-events-none">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-onSurface-muted">
              <span className="material-symbols-outlined">play_circle</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 z-10 pointer-events-none">
          <h3 className="text-sm font-sans font-medium text-onSurface leading-tight line-clamp-2">{title}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-onSurface-muted">
            <span className="truncate max-w-[120px]">{channel}</span>
            {durationFormatted && (
              <>
                <span>•</span>
                <span>{durationFormatted}</span>
              </>
            )}
            {publishedAt && (
              <>
                <span>•</span>
                <span>{new Date(publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </>
            )}
          </div>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2 z-10 pointer-events-none">
              {tags.map(tagId => {
                const tagObj = allTags.find(t => t.id === tagId)
                if (!tagObj) return null
                return (
                  <span key={tagId} className="px-1.5 py-0.5 rounded bg-surface-high/50 text-[9px] font-medium text-onSurface-muted border border-surface-high">
                    #{tagObj.name}
                  </span>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end justify-center self-center gap-2 z-10 pointer-events-none">
          {priorityId && <PriorityChip priorityId={priorityId} showLabel={true} />}
          {status && status !== 'pending' && (
            <div className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-surface-high text-onSurface-muted">
              {status === 'seen' ? 'Visto' : status === 'discarded' ? 'Desc.' : status === 'notion_candidate' ? 'Notion' : status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
