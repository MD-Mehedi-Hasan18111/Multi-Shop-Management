import { Sidebar } from "@/components/shopkeeper/Sidebar";
import { Header } from "@/components/shopkeeper/Header";
import { BottomNav } from "@/components/shopkeeper/BottomNav";

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      <Sidebar />
      <div className="flex flex-col md:flex-1">
        <Header />
        <main className="flex-1 p-4 pb-24 md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
