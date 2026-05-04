import { Suspense } from "react";
import BottomNav from "@/components/ui/BottomNav";
import AddVideoModal from "@/components/features/AddVideoModal";
import AddWebLinkModal from "@/components/features/AddWebLinkModal";
import ShareHandler from "@/components/features/ShareHandler";
import GlobalSearchModal from "@/components/features/GlobalSearchModal";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-1 pb-20">
        {children}
      </main>
      
      <BottomNav />
      <AddVideoModal />
      <AddWebLinkModal />
      <Suspense fallback={null}>
        <ShareHandler />
      </Suspense>
      <GlobalSearchModal />
    </div>
  )
}
