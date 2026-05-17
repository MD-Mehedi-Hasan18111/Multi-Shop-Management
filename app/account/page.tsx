"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Package, Heart, MapPin, LogOut, ShieldCheck, Store, Camera, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [shopBlocked, setShopBlocked] = useState(false);
  const [hasFetchedSettings, setHasFetchedSettings] = useState(false);
  const [hasCheckedRoleSync, setHasCheckedRoleSync] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account");
    }
  }, [status, router]);

  useEffect(() => {
    if (session && (session.user as any)?.role === "shopkeeper" && !hasFetchedSettings) {
      setHasFetchedSettings(true);
      fetch("/api/shopkeeper/settings")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error && data.isBlocked === true) {
            setShopBlocked(true);
          }
        })
        .catch((err) => console.error("Error fetching shop settings:", err));
    }
  }, [session, hasFetchedSettings]);

  useEffect(() => {
    if (session && (session.user as any)?.role === "customer" && !hasCheckedRoleSync) {
      setHasCheckedRoleSync(true);
      fetch("/api/user/become-seller")
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data && data.role === "shopkeeper") {
            update({ role: "shopkeeper" });
          }
        })
        .catch((err) => console.error("Error checking role sync:", err));
    }
  }, [session, update, hasCheckedRoleSync]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // 1. Upload to Cloudinary
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const avatarUrl = uploadData.secure_url;

      // 2. Update User Profile
      const updateRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: avatarUrl }),
      });

      if (updateRes.ok) {
        // 3. Update Session
        await update({ avatar: avatarUrl });
      } else {
        const errorData = await updateRes.json();
        alert(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Avatar change error:", error);
      alert("An error occurred while updating your avatar");
    } finally {
      setUploading(false);
    }
  };

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

  if ((session.user as any)?.role === "customer") {
    menuItems.push({
      name: "Become a Seller",
      href: "/become-seller",
      icon: Store,
      desc: "Apply to create a storefront and sell products on our platform",
    });
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight">My Account</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
        <Button
          onClick={() => {
            setHasFetchedSettings(false);
            setHasCheckedRoleSync(false);
          }}
          variant="outline"
          className="rounded-2xl font-bold text-xs border-zinc-200 hover:bg-zinc-50 shadow-sm shrink-0"
        >
          Refresh Account
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black overflow-hidden border-2 border-white/30">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (session.user as any)?.avatar ? (
                  <img src={(session.user as any).avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{session.user?.name?.[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition active:scale-95 border-4 border-blue-600">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
                <Camera className="h-5 w-5" />
              </label>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-3xl font-black">{session.user?.name || "User"}</h2>
              <p className="text-white/70 font-medium">{session.user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider font-bold">{(session.user as any)?.role === 'shopkeeper' ? "Seller" : (session.user as any)?.role === 'admin' ? "Admin" : "customer"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific panel link */}
      {((session.user as any)?.role === "admin" || (session.user as any)?.role === "shopkeeper") && (
        <Card className={`rounded-2xl transition-all ${shopBlocked ? "opacity-65 cursor-not-allowed border-red-200" : ""}`}>
          <CardContent className="p-6">
            {shopBlocked ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg text-zinc-500">Seller Panel</p>
                    <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      Disabled
                    </span>
                  </div>
                  <p className="text-sm text-red-600 font-semibold mt-0.5">Your shop is disabled.</p>
                </div>
              </div>
            ) : (
              <Link
                href={(session.user as any)?.role === "admin" ? "/admin/dashboard" : "/shopkeeper/dashboard"}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">
                    {(session.user as any)?.role === "admin" ? "Admin Panel" : "Seller Panel"}
                  </p>
                  <p className="text-sm text-muted-foreground">Go to your management dashboard</p>
                </div>
              </Link>
            )}
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
