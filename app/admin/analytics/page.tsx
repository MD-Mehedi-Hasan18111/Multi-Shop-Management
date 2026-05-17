"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Users, Package, ShoppingCart } from "lucide-react";
import { formatBDT } from "@/lib/currency";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Revenue", value: formatBDT(stats?.totalRevenue || 0), icon: DollarSign, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
    { title: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
    { title: "Avg Order Value", value: formatBDT(stats?.avgOrderValue || 0), icon: TrendingUp, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
    { title: "Conversion Rate", value: stats?.conversionRate ? `${stats.conversionRate}%` : "0%", icon: BarChart3, color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Overview of your platform performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-3xl font-black">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 mx-auto opacity-40" />
              <p className="font-medium">Chart data loads from analytics API</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
