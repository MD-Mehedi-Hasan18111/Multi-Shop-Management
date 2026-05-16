"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  Ticket,
  User,
} from "lucide-react";

const navItems = [
  { name: "Dash", href: "/shopkeeper/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/shopkeeper/products", icon: Package },
  { name: "Orders", href: "/shopkeeper/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/shopkeeper/reviews", icon: Star },
  { name: "Coupons", href: "/shopkeeper/coupons", icon: Ticket },
  { name: "Profile", href: "/shopkeeper/profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 flex h-16 w-full border-t bg-background md:hidden">
      <div className="flex w-full items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 text-[10px] transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
