import WatchNowView from "@/components/features/WatchNowView"

export default function WatchPage() {
  return (
    <main className="px-4 pt-6 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex flex-col gap-1 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <h1 className="text-xl font-bold tracking-tight text-onSurface">Qué ver</h1>
        <p className="text-sm text-onSurface-muted">Filtra tu lista para encontrar el vídeo perfecto</p>
      </header>
      <WatchNowView />
    </main>
  )
}
