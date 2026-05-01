import Link from "next/link"
import TagVideoList from "@/components/features/TagVideoList"

export default function TagPage({ params }: { params: { tagId: string } }) {
  const tagId = decodeURIComponent(params.tagId)

  return (
    <main className="px-4 pt-4 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <Link href="/" className="w-10 h-10 rounded-full flex items-center justify-center text-onSurface hover:bg-surface-high transition-colors -ml-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </header>

      <TagVideoList tagId={tagId} />
    </main>
  )
}
