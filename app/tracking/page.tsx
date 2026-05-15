"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TrackingIndexPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/account/orders");
    } else if (status === "authenticated") {
      router.push("/account/orders");
    }
  }, [status, router]);

  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded mx-auto" />
        <div className="h-4 w-64 bg-muted rounded mx-auto" />
      </div>
    </div>
  );
}
