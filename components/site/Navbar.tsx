"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, Store, Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";


import dynamic from "next/dynamic";

const NotificationBell = dynamic(() => import("./NotificationBell"), {
  ssr: false,
  loading: () => <Button variant="ghost" size="icon"><Bell className="h-5 w-5 animate-pulse" /></Button>
});


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const pathname = usePathname();


  // Hide navbar on admin and shopkeeper routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/shopkeeper")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
            <Store className="h-8 w-8 text-primary" />
            <span className="hidden sm:inline">ShopManager</span>
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/products" className="hover:text-primary transition-colors">All Products</Link>
            <Link href="/categories" className="hover:text-primary transition-colors">Categories</Link>
            <Link href="/deals" className="hover:text-primary transition-colors">Deals</Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-9 bg-muted"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Search className="h-5 w-5" />
          </Button>

          <Link href="/wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          <NotificationBell />

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                0
              </Badge>
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link href="/products" className="text-lg font-medium">All Products</Link>
                <Link href="/categories" className="text-lg font-medium">Categories</Link>
                <Link href="/deals" className="text-lg font-medium">Deals</Link>
                <Link href="/account" className="text-lg font-medium">My Account</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
