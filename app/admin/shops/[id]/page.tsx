"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT } from "@/lib/currency";

export default function AdminShopDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShop() {
      try {
        const res = await fetch(`/api/admin/shops/${params.id}`);
        if (res.ok) setData(await res.json());
      } finally {
        setLoading(false);
      }
    }
    loadShop();
  }, [params.id]);

  async function toggleShop() {
    const res = await fetch(`/api/admin/shops/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !data.shop.isBlocked }),
    });
    if (res.ok) {
      const shop = await res.json();
      setData((current: any) => ({ ...current, shop }));
    }
  }

  if (loading) return <div className="text-muted-foreground">Loading shop...</div>;
  if (!data?.shop) return <div className="text-muted-foreground">Shop not found.</div>;

  const { shop, stats, products, orders } = data;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3">
            <Link href="/admin/shops">
              <ArrowLeft className="mr-2 h-4 w-4" /> Shops
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{shop.shopName}</h1>
          <p className="text-muted-foreground">{shop.shopkeeper?.email || shop.contactInfo?.email}</p>
        </div>
        <Button variant={shop.isBlocked ? "default" : "destructive"} onClick={toggleShop}>
          {shop.isBlocked ? "Unblock Selling" : "Block Selling"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Revenue" value={formatBDT(stats.revenue || 0)} />
        <Stat title="Orders" value={`${stats.orderCount || 0}`} />
        <Stat title="Products" value={`${stats.productCount || 0}`} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={shop.isBlocked ? "destructive" : "secondary"}>
              {shop.isBlocked ? "Blocked" : "Selling"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                  <TableCell>{formatBDT(product.price || 0)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/products/${product._id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.user?.name || order.shippingAddress?.name || "Customer"}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatBDT(order.total || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
