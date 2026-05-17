import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { BottomNav } from "@/components/admin/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-muted/40 md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col max-w-full overflow-x-auto">
        <Header />
        <main className="flex-1 items-start p-4 pb-24 sm:p-6 md:gap-8 max-w-full overflow-x-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
