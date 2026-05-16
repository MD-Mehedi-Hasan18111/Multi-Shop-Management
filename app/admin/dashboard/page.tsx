"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Store,
  Tags,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

type Overview = {
  stats: Record<string, number | null>;
  recentOrders: any[];
  topProducts: any[];
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const number = new Intl.NumberFormat("en-US");

function changeText(value: number | null | undefined) {
  if (value === null || value === undefined) return "No previous month data";
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}% from last month`;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.ok) setOverview(await res.json());
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const stats = overview?.stats || {};
  const cards = [
    {
      title: "Total Revenue",
      value: money.format(Number(stats.totalRevenue || 0)),
      helper: changeText(stats.revenueChange as number | null),
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: number.format(Number(stats.totalOrders || 0)),
      helper: `${number.format(Number(stats.monthlyOrders || 0))} this month`,
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: number.format(Number(stats.totalProducts || 0)),
      helper: `${number.format(Number(stats.activeProducts || 0))} active`,
      icon: Package,
    },
    {
      title: "Users",
      value: number.format(Number(stats.totalUsers || 0)),
      helper: `${number.format(Number(stats.totalShopkeepers || 0))} shopkeepers`,
      icon: Users,
    },
    {
      title: "Shops",
      value: number.format(Number(stats.totalShops || 0)),
      helper: "Seller storefronts",
      icon: Store,
    },
    {
      title: "Categories",
      value: number.format(Number(stats.totalCategories || 0)),
      helper: "Catalog taxonomy",
      icon: Tags,
    },
    {
      title: "Low Stock",
      value: number.format(Number(stats.lowStockProducts || 0)),
      helper: "Needs attention",
      icon: AlertTriangle,
    },
    {
      title: "Average Order",
      value: money.format(Number(stats.averageOrderValue || 0)),
      helper: "Across all shops",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage every shop, category, product, order, and user from one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-8 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Shopkeeper</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(overview?.recentOrders || []).map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      <Link href={`/tracking/${order._id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{order.user?.name || order.shippingAddress?.name || "Guest"}</TableCell>
                    <TableCell className="hidden md:table-cell">{order.shopkeeper?.name || "Shop"}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{money.format(order.total || 0)}</TableCell>
                  </TableRow>
                ))}
                {!loading && overview?.recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(overview?.topProducts || []).map((product) => (
              <div key={product._id || product.name} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{number.format(product.sold)} sold</p>
                </div>
                <p className="font-semibold">{money.format(product.revenue || 0)}</p>
              </div>
            ))}
            {!loading && overview?.topProducts.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">No sales data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
