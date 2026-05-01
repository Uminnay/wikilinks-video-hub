import SettingsView from "@/components/features/SettingsView"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30 -mx-4 px-4">
        <Link href="/" className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-onSurface hover:bg-surface-high transition-colors -ml-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-onSurface">Configuración</h1>
      </header>
      
      <SettingsView />
    </main>
  )
}
