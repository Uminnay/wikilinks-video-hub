"use client"

import Link from "next/link"
import { useAppStore } from "@/store/useAppStore"
import { useEffect, useState } from "react"
import HomeVideosView from "@/components/features/HomeVideosView"

export default function HomePage() {
  const theme = useAppStore(state => state.theme)
  const userProfile = useAppStore(state => state.userProfile)
  const toggleTheme = useAppStore(state => state.toggleTheme)
  
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
  }

  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-8">
      <header className="flex justify-between items-center w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tighter text-primary">
            Wikilinks <span className="text-onSurface">{userProfile.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event('open-global-search'))}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high transition-colors text-onSurface"
            title="Buscar (Ctrl+K)"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high transition-colors text-onSurface"
          >
            <span className="material-symbols-outlined">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <Link href="/settings" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high transition-colors text-onSurface">
            <span className="material-symbols-outlined">settings</span>
          </Link>
        </div>
      </header>

      <HomeVideosView />
    </main>
  )
}
