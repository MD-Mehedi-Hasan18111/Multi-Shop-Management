"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    price: "",
    comparePrice: "",
    stock: "",
    category: "",
    description: "",
    images: [] as string[],
  });

  useEffect(() => {
    // Fetch categories for the dropdown
    fetch("/api/products/import")
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" ? { slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
          stock: parseInt(form.stock),
        }),
      });

      if (res.ok) {
        router.push("/shopkeeper/products");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create product");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shopkeeper/products"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Premium Leather Bag" required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input name="slug" value={form.slug} onChange={handleChange} placeholder="auto-generated" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>SKU *</Label>
              <Input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. PLB-001" required />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                required
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label>Compare Price ($)</Label>
                <Input name="comparePrice" type="number" step="0.01" value={form.comparePrice} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Stock *</Label>
                <Input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-3">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground text-sm">
                Drag and drop images here, or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP up to 5MB each
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button variant="outline" type="button" asChild>
            <Link href="/shopkeeper/products">Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading} className="px-8">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
