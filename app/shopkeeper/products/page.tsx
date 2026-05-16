"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Search, Filter, X, ChevronDown, Package, LayoutGrid } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ShopkeeperProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight uppercase italic">Products</h1>
          <p className="text-zinc-500 font-medium">Manage and monitor your shop's premium products.</p>
        </div>
        <Button asChild className="rounded-2xl h-12 px-8 font-bold shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105">
          <Link href="/shopkeeper/products/new">
            <Plus className="mr-2 h-5 w-5" /> Add New Product
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              placeholder="Search by product name..."
              className="pl-12 h-12 rounded-xl border-zinc-100 dark:border-zinc-800 focus:ring-blue-500 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full h-12 rounded-xl border-zinc-100 dark:border-zinc-800 justify-between px-4 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-zinc-400" />
                    {selectedCategory ? categories.find(c => c.slug === selectedCategory || c._id === selectedCategory)?.name : "All Categories"}
                  </div>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl p-2">
                <DropdownMenuItem onClick={() => setSelectedCategory(null)} className="rounded-lg font-medium">
                  All Categories
                </DropdownMenuItem>
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat._id} onClick={() => setSelectedCategory(cat.slug)} className="rounded-lg font-medium">
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-3 px-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-4 py-1.5 rounded-full font-bold">
              {products.length} Products Found
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-red-500 hover:text-red-600 font-bold h-9 rounded-full px-4 hover:bg-red-50">
              Clear Filters <X className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-zinc-200/50 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-zinc-500 font-bold animate-pulse">Fetching Products</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
                    <TableHead className="pl-8 py-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Product</TableHead>
                    <TableHead className="py-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">SKU</TableHead>
                    <TableHead className="py-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Price</TableHead>
                    <TableHead className="py-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Stock</TableHead>
                    <TableHead className="py-5 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Status</TableHead>
                    <TableHead className="pr-8 py-5 text-right text-zinc-400 font-bold uppercase tracking-wider text-[11px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="h-12 w-12 text-zinc-200" />
                          <p className="text-zinc-400 font-medium">No products match your current filters.</p>
                          <Button variant="outline" onClick={handleClearFilters} className="rounded-xl mt-2 font-bold">Reset Filters</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product._id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors border-zinc-100 dark:border-zinc-800">
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/50 shrink-0 shadow-sm">
                              {product.images && product.images.length > 0 ? (
                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                              ) : (
                                <Package className="h-6 w-6 m-auto absolute inset-0 text-zinc-300" />
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{product.name}</span>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                {categories.find(c => c._id === product.category?._id || c._id === product.category)?.name || "Product"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-zinc-500">{product.sku || "N/A"}</TableCell>
                        <TableCell className="font-black text-zinc-900 dark:text-zinc-100">
                          BDT {product.price.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "font-bold px-3 py-1 rounded-lg text-sm",
                            product.stock <= 5 ? "text-rose-500 bg-rose-50" : "text-zinc-600 bg-zinc-100"
                          )}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          {product.stock > 0 ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg px-3 py-1 font-bold shadow-none">Active</Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-rose-50 text-rose-600 border-none rounded-lg px-3 py-1 font-bold shadow-none">Out of Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <div className="flex justify-end gap-2 opacity-1 group-hover:opacity-100 transition-opacity">
                            <Link href={`/shopkeeper/products/${product._id}`}>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-zinc-400">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product._id)} className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-zinc-400">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
