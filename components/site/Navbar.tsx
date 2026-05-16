"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, Store, Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import ProductSearch from "./ProductSearch";

import dynamic from "next/dynamic";

const NotificationBell = dynamic(() => import("./NotificationBell"), {
  ssr: false,
  loading: () => <Button variant="ghost" size="icon"><Bell className="h-5 w-5 animate-pulse" /></Button>
});

const navLinks = [
  { name: "Home", href: "/" },
  { name: "All Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Deals", href: "/deals" },
  { name: "Shops", href: "/shops" },
];

export function Navbar() {
  const pathname = usePathname();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.length;
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const wishlistCount = wishlistItems.length;
  const { data: session } = useSession();

  // Hide navbar on admin and shopkeeper routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/shopkeeper")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 font-black text-xl sm:text-2xl tracking-tighter italic uppercase">
            <Store className="h-6 w-6 sm:h-8 sm:h-8 text-primary" />
            <span className="hidden lg:inline">ShopManager</span>
          </Link>
          <div className="hidden md:flex gap-4 lg:gap-8 text-[10px] lg:text-xs font-bold uppercase tracking-widest h-16 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative h-full flex items-center transition-all hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <ProductSearch />

        <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
          <Link href="/wishlist">
            <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10 relative">
              <Heart className="h-4 w-4 sm:h-5 sm:h-5" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[8px] sm:text-[10px] bg-red-600">
                  {wishlistCount}
                </Badge>
              )}
            </Button>
          </Link>

          <NotificationBell />

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative w-8 h-8 sm:w-10 sm:h-10">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[8px] sm:text-[10px] bg-blue-600">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link href={session ? "/account" : "/login"}>
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 sm:w-10 sm:h-10">
              <User className="h-4 w-4 sm:h-5 sm:h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
