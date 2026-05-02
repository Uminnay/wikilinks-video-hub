"use client"

import Link from "next/link"
import { useAppStore } from "@/store/useAppStore"

interface WebLinkRowProps {
  id: string
  title: string
  url: string
  priorityId: string | null
  status: 'pending' | 'seen' | 'discarded' | 'notion_candidate'
  tags?: string[]
  onAction: (action: 'seen' | 'discard' | 'notion' | 'custom') => void
}

export default function WebLinkRow({
  id,
  title,
  url,
  priorityId,
  status,
  tags = [],
  onAction
}: WebLinkRowProps) {
  const priorities = useAppStore(state => state.priorities)
  const storeTags = useAppStore(state => state.tags)
  
  const prio = priorities.find(p => p.id === priorityId)
  const linkTags = storeTags.filter(t => tags.includes(t.id))

  let domain = ""
  try {
    domain = new URL(url).hostname.replace('www.', '')
  } catch (e) {
    domain = url
  }

  return (
    <div className="bg-surface-low border border-surface-high rounded-xl p-3 flex flex-col gap-3 group hover:bg-surface-high/50 transition-colors">
      
      {/* Upper part: Info */}
      <div className="flex gap-3">
        {/* Left: Icon or Initials */}
        <div className="w-12 h-12 bg-surface-high rounded-lg flex items-center justify-center flex-shrink-0 text-onSurface-muted">
          <span className="material-symbols-outlined text-[24px]">language</span>
        </div>

        {/* Right: Text */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-onSurface leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-[11px] text-onSurface-muted mt-1 truncate">
            {domain}
          </p>
        </div>
      </div>

      {/* Middle part: Metadata */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {prio && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: prio.colorHex }}></div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: prio.colorHex }}>
              {prio.label}
            </span>
          </div>
        )}
        
        {linkTags.map(tag => (
          <span key={tag.id} className="text-[10px] uppercase tracking-wider text-onSurface-muted bg-surface-high px-1.5 py-0.5 rounded">
            #{tag.name}
          </span>
        ))}
      </div>

      {/* Bottom part: Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-high/50">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:text-primary-focus flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          Abrir enlace
        </a>

        {status === 'pending' && (
          <div className="flex items-center gap-1">
            <button onClick={() => onAction('discard')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 hover:text-error text-onSurface-muted transition-colors">
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
            <button onClick={() => onAction('notion')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-status-notion/10 hover:text-status-notion text-onSurface-muted transition-colors" title="Enviar a Notion">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.739 0 1.258.125 1.705.41l.161.104 12.015 8.76V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h5.452v1.208h-.311c-.636 0-.965.358-.965 1.211v15.582c0 .284-.131.547-.361.713-.23.165-.526.212-.796.126l-.168-.063L5.451 11.233V18.58c0 .853.33 1.211.965 1.211h.311V21H1.275v-1.208h.311c.636 0 .965-.358.965-1.211V5.419c0-.853-.33-1.211-.965-1.211h-.311V3h3.184z"/>
              </svg>
            </button>
            <button onClick={() => onAction('seen')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-success/10 hover:text-success text-onSurface-muted transition-colors" title="Marcar como visto">
              <span className="material-symbols-outlined text-[18px]">check</span>
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
