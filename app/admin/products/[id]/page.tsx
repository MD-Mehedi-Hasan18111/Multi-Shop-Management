"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBDT } from "@/lib/currency";

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) setProduct(await res.json());
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.id]);

  async function toggleProduct() {
    const res = await fetch(`/api/products/${product._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !product.isActive }),
    });
    if (res.ok) setProduct(await res.json());
  }

  if (loading) return <div className="text-muted-foreground">Loading product...</div>;
  if (!product) return <div className="text-muted-foreground">Product not found.</div>;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-3">
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" /> Products
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground">{product.sku || "No SKU"}</p>
        </div>
        <Button variant={product.isActive ? "outline" : "default"} onClick={toggleProduct}>
          {product.isActive ? "Disable Product" : "Enable Product"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              ) : (
                <Package className="absolute inset-0 m-auto h-16 w-16 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Price" value={formatBDT(product.price || 0)} />
            <Detail label="Compare Price" value={product.comparePrice ? formatBDT(product.comparePrice) : "N/A"} />
            <Detail label="Stock" value={`${product.stock || 0}`} />
            <Detail label="Low Stock Threshold" value={`${product.lowStockThreshold || 0}`} />
            <Detail label="Category" value={product.category?.name || "Uncategorized"} />
            <Detail label="Shopkeeper" value={product.shopkeeper?.name || "Unknown"} />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={!product.isActive || product.stock === 0 ? "destructive" : "secondary"}>
                {!product.isActive ? "Inactive" : product.stock === 0 ? "Out of stock" : "Active"}
              </Badge>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="leading-7">{product.description || "No description provided."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
