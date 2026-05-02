import Link from "next/link"
import CategoryVideoList from "@/components/features/CategoryVideoList"

export default function CategoryPage({ 
  params,
  searchParams 
}: { 
  params: { name: string },
  searchParams: { type?: string }
}) {
  const categoryName = decodeURIComponent(params.name)
  const isWebs = searchParams.type === 'webs'

  return (
    <main className="px-4 pt-4 pb-24 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="flex items-center gap-3 w-full sticky top-0 bg-background/80 backdrop-blur-md py-3 z-30">
        <Link href={isWebs ? "/webs" : "/"} className="w-10 h-10 rounded-full flex items-center justify-center text-onSurface hover:bg-surface-high transition-colors -ml-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-onSurface truncate">{categoryName}</h1>
      </header>

      <CategoryVideoList categoryName={categoryName} type={isWebs ? 'webs' : 'videos'} />
    </main>
  )
}
