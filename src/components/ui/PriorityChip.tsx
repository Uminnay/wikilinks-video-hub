"use client"

import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"

interface PriorityChipProps {
  priorityId: string | null | undefined
  className?: string
  showLabel?: boolean
}

export default function PriorityChip({ priorityId, className, showLabel = true }: PriorityChipProps) {
  const priorities = useAppStore(state => state.priorities)
  
  if (!priorityId) return null
  
  const prio = priorities.find(p => p.id === priorityId)
  if (!prio) return null

  const isHigh = prio.level >= 3

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div 
        className="w-2 h-2 rounded-full" 
        style={{ 
          backgroundColor: prio.colorHex,
          boxShadow: isHigh ? `0 0 6px ${prio.colorHex}80` : 'none'
        }}
      />
      {showLabel && (
        <span className="text-[10px] font-sans font-medium tracking-wide uppercase" style={{ color: prio.colorHex }}>
          {prio.label}
        </span>
      )}
    </div>
  )
}
