import HistoryView from "@/components/features/HistoryView"

export default function HistoryPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-1 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <h1 className="text-xl font-bold tracking-tight text-onSurface flex items-center gap-2">
          <span className="material-symbols-outlined text-onSurface-muted">history</span> Historial de Vistos
        </h1>
        <p className="text-sm text-onSurface-muted">Vídeos que ya has marcado como vistos. Puedes eliminarlos o restaurarlos a pendientes.</p>
      </header>
      <HistoryView />
    </main>
  )
}
