"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Grid, Percent, Store, User, ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Grid },
  { name: "Deals", href: "/deals", icon: Percent },
  { name: "Shops", href: "/shops", icon: Store },
];

export default function BottomNav() {
  const pathname = usePathname();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Hide on admin and shopkeeper routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/shopkeeper")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-zinc-200 md:hidden flex items-center justify-around pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300",
              isActive ? "text-blue-600" : "text-zinc-400"
            )}
          >
            <div className={cn(
              "p-1 rounded-xl transition-all",
              isActive ? "bg-blue-50" : ""
            )}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[8px] font-bold uppercase tracking-wider">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
