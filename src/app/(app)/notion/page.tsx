import NotionView from "@/components/features/NotionView"

export default function NotionPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-1 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <h1 className="text-xl font-bold tracking-tight text-onSurface">Guardar en Notion</h1>
        <p className="text-sm text-onSurface-muted">Prepara los vídeos antes de exportarlos a tu base de conocimiento.</p>
      </header>
      <NotionView />
    </main>
  )
}
