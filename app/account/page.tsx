"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Package, Heart, MapPin, LogOut, ShieldCheck, Store } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  const menuItems = [
    { name: "My Orders", href: "/account/orders", icon: Package, desc: "Track and manage your orders" },
    { name: "Wishlist", href: "/wishlist", icon: Heart, desc: "Your saved products" },
    { name: "Addresses", href: "/account/addresses", icon: MapPin, desc: "Manage shipping addresses" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">My Account</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
              {session.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black">{session.user?.name || "User"}</h2>
              <p className="text-white/70">{session.user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm capitalize font-medium">{(session.user as any)?.role || "customer"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific panel link */}
      {((session.user as any)?.role === "admin" || (session.user as any)?.role === "shopkeeper") && (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <Link
              href={(session.user as any)?.role === "admin" ? "/admin/dashboard" : "/shopkeeper/dashboard"}
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">
                  {(session.user as any)?.role === "admin" ? "Admin Panel" : "Shopkeeper Panel"}
                </p>
                <p className="text-sm text-muted-foreground">Go to your management dashboard</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Menu Items */}
      <div className="grid gap-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="rounded-2xl hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

      <Button
        variant="outline"
        className="w-full h-14 text-lg font-bold rounded-2xl text-destructive hover:bg-destructive/10 border-destructive/20"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Sign Out
      </Button>
    </div>
  );
}
