"use client"
import { useEffect } from "react"
import { useAppStore } from "@/store/useAppStore"

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(state => state.theme)
  
  useEffect(() => {
    const html = document.documentElement
    // Remove all theme classes first
    html.classList.remove('light', 'dark')
    // Add the correct one
    html.classList.add(theme === 'light' ? 'light' : 'dark')
    // Also set a data attribute as backup
    html.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
}
