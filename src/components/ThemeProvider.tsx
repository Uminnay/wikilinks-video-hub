"use client"
import { useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(state => state.theme)
  const textSize = useAppStore(state => state.textSize)
  const initializeStore = useAppStore(state => state.initializeStore)

  useEffect(() => {
    initializeStore()
  }, [initializeStore])
  
  useEffect(() => {
    const html = document.documentElement
    // Remove all theme classes first
    html.classList.remove('light', 'dark')
    // Add the correct one
    html.classList.add(theme === 'light' ? 'light' : 'dark')
    // Also set a data attribute as backup
    html.setAttribute('data-theme', theme)
    
    // Handle text size levels
    html.classList.remove('text-large', 'text-extra-large', 'large-text-mode')
    if (textSize !== 'normal') {
      html.classList.add(`text-${textSize}`)
    }
  }, [theme, textSize])

  return <>{children}</>
}
