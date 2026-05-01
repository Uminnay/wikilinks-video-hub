import Link from "next/link"
import VideoDetailView from "@/components/features/VideoDetailView"

export default function VideoPage({ params }: { params: { id: string } }) {
  const { id } = params
  
  return (
    <main className="px-4 pt-4 pb-24 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-6 sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30 -mx-4 px-4">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-high transition-colors -ml-2">
          <span className="material-symbols-outlined text-onSurface">arrow_back</span>
        </Link>
        <span className="text-sm font-medium text-onSurface-muted">Detalles del vídeo</span>
      </header>

      <VideoDetailView videoId={id} />
    </main>
  )
}
