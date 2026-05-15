"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2 } from "lucide-react";
import Link from "next/link";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/notifications");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(Array.isArray(data) ? data : data.notifications || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-4">
        <h1 className="text-4xl font-black tracking-tight">Notifications</h1>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl space-y-8">
      <h1 className="text-4xl font-black tracking-tight">Notifications</h1>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif._id}
              className={`rounded-2xl transition-all ${
                notif.read ? "opacity-60" : "border-primary/20 shadow-md"
              }`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.read ? "bg-muted" : "bg-primary/10"
                }`}>
                  <Bell className={`h-5 w-5 ${notif.read ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{notif.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => markAsRead(notif._id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
            <Bell size={40} />
          </div>
          <h2 className="text-2xl font-black">No notifications</h2>
          <p className="text-muted-foreground">You&apos;re all caught up!</p>
        </div>
      )}
    </div>
  );
}
