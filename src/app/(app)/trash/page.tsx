import TrashView from "@/components/features/TrashView"

export default function TrashPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-1 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <h1 className="text-xl font-bold tracking-tight text-error flex items-center gap-2">
          <span className="material-symbols-outlined">delete</span> Papelera
        </h1>
        <p className="text-sm text-onSurface-muted">Vídeos descartados. Puedes restaurarlos o eliminarlos permanentemente.</p>
      </header>
      <TrashView />
    </main>
  )
}
