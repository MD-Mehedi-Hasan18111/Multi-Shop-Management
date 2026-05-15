"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";
import Link from "next/link";

export default function AddressesPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account/addresses");
    }
  }, [status, router]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight">My Addresses</h1>
        <Button variant="outline" asChild>
          <Link href="/account">← Back to Account</Link>
        </Button>
      </div>

      <div className="text-center py-24 space-y-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <MapPin size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black">No addresses saved</h2>
          <p className="text-zinc-500">Add a shipping address for faster checkout.</p>
        </div>
        <Button className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-5 w-5" /> Add Address
        </Button>
      </div>
    </div>
  );
}
