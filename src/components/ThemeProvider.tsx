"use client"
import { useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(state => state.theme)
  const largeTextMode = useAppStore(state => state.largeTextMode)
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
    
    // Handle large text mode
    if (largeTextMode) {
      html.classList.add('large-text-mode')
    } else {
      html.classList.remove('large-text-mode')
    }
  }, [theme, largeTextMode])

  return <>{children}</>
}
