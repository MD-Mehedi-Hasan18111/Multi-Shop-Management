"use client";

import React, { useEffect, useState } from "react";
import { Bell, Package, CheckCircle2, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "order_update" | "new_product" | "promotion" | "system";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // In a real app, we'd set up a Pusher/WebSocket listener here
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data: Notification[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);

    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order_update": return <Package size={16} className="text-blue-500" />;
      case "new_product": return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-zinc-500" />;
    }
  };

  if (!session) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-zinc-200 dark:border-zinc-800 mr-4 mt-2">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold">Notifications</h3>
          {unreadCount > 0 && <span className="text-xs text-blue-600 font-medium">Mark all as read</span>}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n._id} 
                onClick={() => markAsRead(n._id)}
                className={`p-4 border-b border-zinc-50 dark:border-zinc-800/50 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors ${!n.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
              >
                <div className="mt-1 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${!n.isRead ? "font-bold text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-zinc-500 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-zinc-400">{new Date(n.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500">
              <p>No notifications yet.</p>
            </div>
          )}
        </div>
        <div className="p-3 text-center border-t border-zinc-100 dark:border-zinc-800">
          <Link href="/notifications" className="text-xs text-blue-600 font-bold hover:underline">
            View All Notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
