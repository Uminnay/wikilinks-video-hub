import BottomNav from "@/components/ui/BottomNav";
import AddVideoModal from "@/components/features/AddVideoModal";

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
    </div>
  )
}
