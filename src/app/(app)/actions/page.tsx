import ActionsView from "@/components/features/ActionsView"

export default function ActionsPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-1 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <h1 className="text-xl font-bold tracking-tight text-onSurface">Acciones</h1>
        <p className="text-sm text-onSurface-muted">Gestiona las tareas extraídas de tus vídeos</p>
      </header>
      <ActionsView />
    </main>
  )
}
