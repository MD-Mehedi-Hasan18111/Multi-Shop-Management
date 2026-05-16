"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Store,
  Star,
  Ticket,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/shopkeeper/dashboard", icon: LayoutDashboard },
  { name: "My Products", href: "/shopkeeper/products", icon: Package },
  { name: "Orders", href: "/shopkeeper/orders", icon: ShoppingCart },
  { name: "Moderate Reviews", href: "/shopkeeper/reviews", icon: Star },
  { name: "Coupons", href: "/shopkeeper/coupons", icon: Ticket },
  { name: "Shop Profile", href: "/shopkeeper/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <Store className="h-6 w-6" />
          <span className="">Shopkeeper Panel</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
