"use client";

import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid, List, ChevronDown, Search, Filter as FilterIcon, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { IProduct } from "@/types/product";
import { useSearchParams } from "next/navigation";

interface ProductsListClientProps {
  initialProducts: IProduct[];
  categories: any[];
  shops: any[];
}

export default function ProductsListClient({ initialProducts, categories, shops }: ProductsListClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const shopParam = searchParams.get("shop");

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedShop, setSelectedShop] = useState<string | null>(shopParam);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (shopParam) setSelectedShop(shopParam);
  }, [categoryParam, shopParam]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category?.slug === selectedCategory);
    }

    // Shop filter
    if (selectedShop) {
      result = result.filter(p => p.shop?._id === selectedShop || p.shop?.slug === selectedShop);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [initialProducts, searchQuery, selectedCategory, selectedShop, sortBy]);

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedShop ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedShop(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              placeholder="Search products..."
              className="pl-12 h-14 rounded-2xl border-zinc-200 bg-white shadow-sm focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 p-1 rounded-xl shrink-0">
              <Button
                variant={viewType === "grid" ? "secondary" : "ghost"}
                size="icon"
                className={viewType === "grid" ? "bg-white shadow-sm rounded-lg" : "rounded-lg"}
                onClick={() => setViewType("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === "list" ? "secondary" : "ghost"}
                size="icon"
                className={viewType === "list" ? "bg-white shadow-sm rounded-lg" : "rounded-lg"}
                onClick={() => setViewType("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-zinc-200 font-bold gap-2">
                  Sort: {sortBy === "newest" ? "Newest" : sortBy === "price-asc" ? "Price Low" : "Price High"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest Arrivals</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-asc")}>Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price-desc")}>Price: High to Low</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Categories & Shops Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <FilterIcon size={18} className="text-zinc-400" />
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Filters:</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedCategory ? "secondary" : "outline"} className="rounded-full gap-2 border-zinc-200">
                {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name : "All Categories"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-auto rounded-xl">
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
              {categories.map((cat) => (
                <DropdownMenuItem key={cat._id} onClick={() => setSelectedCategory(cat.slug)}>
                  {cat.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedShop ? "secondary" : "outline"} className="rounded-full gap-2 border-zinc-200">
                {selectedShop ? shops.find(s => s._id === selectedShop || s.slug === selectedShop)?.shopName : "All Shops"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-auto rounded-xl">
              <DropdownMenuItem onClick={() => setSelectedShop(null)}>All Shops</DropdownMenuItem>
              {shops.map((shop) => (
                <DropdownMenuItem key={shop._id} onClick={() => setSelectedShop(shop.slug || shop._id)}>
                  {shop.shopName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" className="text-red-500 hover:text-red-600 font-bold" onClick={clearFilters}>
              Clear All <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Showing</span>
        <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold px-3">
          {filteredProducts.length}
        </Badge>
        <span className="text-sm text-zinc-500">products found</span>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={viewType === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
          : "grid grid-cols-1 gap-6"
        }>
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} variant={viewType} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-200/50">
            <Search className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="text-2xl font-black mb-2">No products found</h3>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto">Try adjusting your filters or search query to find what you&apos;re looking for.</p>
          <Button onClick={clearFilters} className="rounded-full px-8">Reset Filters</Button>
        </div>
      )}

      {/* Pagination Placeholder */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center pt-12">
          <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl border-zinc-200 font-black">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}
