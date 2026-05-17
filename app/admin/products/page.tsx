"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye, Package, Search, Trash2 } from "lucide-react";
import { formatBDT } from "@/lib/currency";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [shopkeeper, setShopkeeper] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
    fetch("/api/admin/shops")
      .then((res) => (res.ok ? res.json() : []))
      .then(setShops)
      .catch(() => setShops([]));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (status) params.set("status", status);
    if (shopkeeper) params.set("shopkeeper", shopkeeper);
    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      setProducts(res.ok ? await res.json() : []);
    } finally {
      setLoading(false);
    }
  }, [category, search, shopkeeper, status]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  async function toggleProduct(product: any) {
    const res = await fetch(`/api/products/${product._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    }
  }

  async function deleteProduct(product: any) {
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
    if (res.ok) setProducts((current) => current.filter((item) => item._id !== product._id));
    else alert((await res.json()).error || "Failed to delete product");
  }

  const categoryLabel = categories.find((item) => item._id === category || item.slug === category)?.name;
  const shopLabel = shops.find((shop) => shop.shopkeeper?._id === shopkeeper)?.shopName;

  return (
    <div className="grid gap-4 md:gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage products across every shop.</p>
        </div>
        <Button asChild>
          <Link href="/shopkeeper/products/new">Add Product</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <CardTitle>Product Inventory</CardTitle>
          <div className="grid gap-2 md:grid-cols-[minmax(240px,1fr)_180px_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {categoryLabel || "All categories"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setCategory("")}>All categories</DropdownMenuItem>
                {categories.map((item) => (
                  <DropdownMenuItem key={item._id} onClick={() => setCategory(item._id)}>
                    {item.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                  {status || "All statuses"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatus("")}>All statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("active")}>Active</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("inactive")}>Inactive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("low-stock")}>Low stock</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("out-of-stock")}>Out of stock</DropdownMenuItem>
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
                <TableHead>Product</TableHead>
                <TableHead className="hidden lg:table-cell">Shopkeeper</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-md bg-muted">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.sku || "No SKU"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{product.shopkeeper?.name || "Unknown"}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.category?.name || "Uncategorized"}</TableCell>
                  <TableCell>{formatBDT(product.price || 0)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={!product.isActive || product.stock === 0 ? "destructive" : "secondary"}>
                      {!product.isActive ? "Inactive" : product.stock === 0 ? "Out of stock" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleProduct(product)}>
                        {product.isActive ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/${product._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No products found.
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
