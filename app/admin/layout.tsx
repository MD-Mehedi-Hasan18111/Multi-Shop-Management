import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { BottomNav } from "@/components/admin/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-col md:flex-1">
        <Header />
        <main className="flex-1 items-start p-4 pb-24 sm:px-6 sm:py-6 md:gap-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
