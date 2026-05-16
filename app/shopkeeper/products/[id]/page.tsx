"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Upload, Plus, X } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    const fetchData = async () => {
      try {
        setFetching(true);
        // Fetch categories
        const catRes = await fetch("/api/categories");
        const cats = await catRes.json();
        setCategories(cats);

        // Fetch product details
        const prodRes = await fetch(`/api/products/${id}`);
        if (!prodRes.ok) throw new Error("Product not found");
        const product = await prodRes.json();

        setForm({
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price.toString(),
          comparePrice: product.comparePrice ? product.comparePrice.toString() : "",
          stock: product.stock.toString(),
          category: typeof product.category === 'object' ? product.category._id : product.category,
          description: product.description,
          images: product.images || [],
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load product data");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && !form.slug ? { slug: value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : {}),
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setCreatingCategory(true);
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
        setForm((prev) => ({ ...prev, category: newCat._id }));
        setNewCategoryName("");
        setShowCategoryInput(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create category");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while creating category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, data.secure_url],
        }));
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to upload image");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during upload.");
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
          stock: parseInt(form.stock),
        }),
      });

      if (res.ok) {
        router.push("/shopkeeper/products");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update product");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shopkeeper/products"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Modify your product listing</p>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SKU *</Label>
                <Input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. PLB-001" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Category *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setShowCategoryInput(!showCategoryInput)}
                  >
                    {showCategoryInput ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                    {showCategoryInput ? "Cancel" : "Create New"}
                  </Button>
                </div>

                {showCategoryInput ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="New category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      disabled={creatingCategory}
                    />
                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                    >
                      {creatingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                  </div>
                ) : (
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>
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
                <Label>Price (BDT) *</Label>
                <Input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label>Compare Price (BDT)</Label>
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
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-3 relative group">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                {uploadingImage ? (
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                ) : (
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto group-hover:text-blue-600 transition-colors" />
                )}
                <p className="text-muted-foreground text-sm font-medium">
                  {uploadingImage ? "Uploading..." : "Drag and drop images here, or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 5MB each
                </p>
              </div>
            </div>

            {form.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-square">
                    <img src={img} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
