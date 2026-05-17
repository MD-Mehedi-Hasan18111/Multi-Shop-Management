"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
import { formatBDT } from "@/lib/currency";

const statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [shopkeeper, setShopkeeper] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (shopkeeper) params.set("shopkeeper", shopkeeper);
    try {
      const res = await fetch(`/api/orders?${params.toString()}`);
      setOrders(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }, [shopkeeper]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    fetch("/api/admin/shops")
      .then((res) => (res.ok ? res.json() : []))
      .then(setShops)
      .catch(() => setShops([]));
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status ? order.status === status : true;
      const matchesSearch = term
        ? [order.orderNumber, order.user?.name, order.user?.email, order.shippingAddress?.name]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, status]);

  const shopLabel = shops.find((shop) => shop.shopkeeper?._id === shopkeeper)?.shopName;

  async function updateStatus(order: any, nextStatus: string) {
    const res = await fetch(`/api/orders/${order._id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } else {
      alert((await res.json()).error || "Failed to update order status");
    }
  }

  return (
    <div className="grid gap-4 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">View and manage customer orders across all shops.</p>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>All Orders</CardTitle>
          <div className="grid gap-2 md:grid-cols-[minmax(240px,1fr)_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders..."
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {status || "All statuses"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatus("")}>All statuses</DropdownMenuItem>
                {statuses.map((item) => (
                  <DropdownMenuItem key={item} onClick={() => setStatus(item)}>
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {shopLabel || "All shops"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShopkeeper("")}>All shops</DropdownMenuItem>
                {shops.map((shop) => (
                  <DropdownMenuItem
                    key={shop._id}
                    onClick={() => setShopkeeper(shop.shopkeeper?._id || "")}
                  >
                    {shop.shopName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden lg:table-cell">Shop</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>{order.user?.name || order.shippingAddress?.name || "Customer"}</div>
                    <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{order.shopkeeper?.name || "Shop"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>{formatBDT(order.total || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Update <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {statuses.map((item) => (
                          <DropdownMenuItem key={item} onClick={() => updateStatus(order, item)}>
                            {item}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No orders found.
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
