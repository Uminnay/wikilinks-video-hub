"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Ocultar la barra si el teclado está abierto (útil en Android)
  useEffect(() => {
    const handleResize = () => {
      // Si la altura de la ventana disminuye significativamente, asumimos que se abrió el teclado
      if (window.visualViewport) {
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight - 100)
      }
    }
    
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)

  if (isKeyboardOpen) return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl flex justify-around items-center px-2 py-3 bg-surface-low border-t border-surface-high border-x shadow-[0px_-4px_24px_rgba(0,0,0,0.5)] z-40 rounded-t-xl pb-safe">
      
      {/* 1. Vídeos (Inicio) */}
      <Link href="/" className={`flex flex-col items-center justify-center p-2 flex-1 mx-0.5 transition-all ${pathname === '/' ? 'text-primary' : 'text-onSurface-muted hover:text-onSurface'}`}>
        <span className={`material-symbols-outlined text-[24px] ${pathname === '/' ? 'fill' : ''}`}>video_library</span>
        <span className="font-sans text-[9px] tracking-wider uppercase mt-1">Vídeos</span>
      </Link>

      {/* 2. Webs */}
      <Link href="/webs" className={`flex flex-col items-center justify-center p-2 flex-1 mx-0.5 transition-all ${pathname.startsWith('/webs') ? 'text-primary' : 'text-onSurface-muted hover:text-onSurface'}`}>
        <span className={`material-symbols-outlined text-[24px] ${pathname.startsWith('/webs') ? 'fill' : ''}`}>language</span>
        <span className="font-sans text-[9px] tracking-wider uppercase mt-1">Webs</span>
      </Link>

      {/* 3. Añadir (Center FAB) */}
      <div className="flex flex-col items-center justify-center flex-[1.2] mx-1 relative h-full">
        {isAddMenuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsAddMenuOpen(false)}></div>
            <div className="absolute -top-[120px] flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
              <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('open-add-web')); setIsAddMenuOpen(false); }}
                className="flex items-center gap-3 bg-surface-low border border-surface-high px-4 py-2.5 rounded-2xl shadow-xl hover:bg-surface-high transition-colors whitespace-nowrap text-onSurface text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-primary">language</span>
                </div>
                <span className="font-medium pr-2">Añadir Web</span>
              </button>
              <button 
                onClick={() => { window.dispatchEvent(new CustomEvent('open-add-video')); setIsAddMenuOpen(false); }}
                className="flex items-center gap-3 bg-surface-low border border-surface-high px-4 py-2.5 rounded-2xl shadow-xl hover:bg-surface-high transition-colors whitespace-nowrap text-onSurface text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-primary">video_library</span>
                </div>
                <span className="font-medium pr-2">Añadir Vídeo</span>
              </button>
            </div>
          </>
        )}
        <button 
          onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
          className="absolute -top-10 w-14 h-14 bg-gradient-to-br from-[#7C5CFC] to-[#947DFF] rounded-full flex items-center justify-center text-white shadow-[0_4px_16px_rgba(124,92,252,0.5)] active:scale-95 transition-transform z-40"
          aria-label="Añadir"
        >
          <span className={`material-symbols-outlined text-[32px] transition-transform duration-300 ${isAddMenuOpen ? 'rotate-45' : ''}`}>add</span>
        </button>
      </div>

      {/* 4. Qué ver */}
      <Link href="/watch" className={`flex flex-col items-center justify-center p-2 flex-1 mx-0.5 transition-all ${pathname === '/watch' ? 'text-primary' : 'text-onSurface-muted hover:text-onSurface'}`}>
        <span className={`material-symbols-outlined text-[24px] ${pathname === '/watch' ? 'fill' : ''}`}>play_circle</span>
        <span className="font-sans text-[9px] tracking-wider uppercase mt-1">Qué ver</span>
      </Link>

      {/* 5. Acciones */}
      <Link href="/actions" className={`flex flex-col items-center justify-center p-2 flex-1 mx-0.5 transition-all ${pathname === '/actions' ? 'text-primary' : 'text-onSurface-muted hover:text-onSurface'}`}>
        <span className={`material-symbols-outlined text-[24px] ${pathname === '/actions' ? 'fill' : ''}`}>check_circle</span>
        <span className="font-sans text-[9px] tracking-wider uppercase mt-1">Acciones</span>
      </Link>
      
    </nav>
  )
}
