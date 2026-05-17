"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { formatBDT } from "@/lib/currency";

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadShops = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/admin/shops?${params.toString()}`);
      setShops(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadShops, 300);
    return () => clearTimeout(timer);
  }, [loadShops]);

  async function toggleShop(shop: any) {
    const res = await fetch("/api/admin/shops", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId: shop._id, isBlocked: !shop.isBlocked }),
    });
    if (res.ok) {
      const updated = await res.json();
      setShops((current) =>
        current.map((item) =>
          item._id === updated._id
            ? { ...item, isBlocked: updated.isBlocked, shopkeeper: updated.shopkeeper }
            : item
        )
      );
    } else {
      alert((await res.json()).error || "Failed to update shop");
    }
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
        <p className="text-muted-foreground">Monitor seller shops, owners, products, orders, and revenue.</p>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>All Shops</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search shops..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop._id}>
                  <TableCell>
                    <div className="font-medium">{shop.shopName}</div>
                    <div className="text-xs text-muted-foreground">/{shop.slug || "shop"}</div>
                  </TableCell>
                  <TableCell>
                    <div>{shop.shopkeeper?.name || "Unassigned"}</div>
                    <div className="text-xs text-muted-foreground">{shop.shopkeeper?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {shop.activeProductCount}/{shop.productCount} active
                    </Badge>
                  </TableCell>
                  <TableCell>{shop.orderCount}</TableCell>
                  <TableCell>{formatBDT(shop.revenue || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={shop.isBlocked ? "destructive" : "secondary"}>
                      {shop.isBlocked ? "Blocked" : "Selling"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleShop(shop)}>
                        {shop.isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/shops/${shop._id}`}>View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && shops.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No shops found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
