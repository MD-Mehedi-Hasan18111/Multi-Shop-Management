"use client";

import { useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Grid, List, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IProduct } from "@/types/product";

interface ProductsListClientProps {
  initialProducts: IProduct[];
}

export default function ProductsListClient({ initialProducts }: ProductsListClientProps) {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [products] = useState(initialProducts);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
        <div className="flex items-center gap-4">
          <div className="flex border rounded-lg overflow-hidden">
            <Button 
              variant={viewType === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              onClick={() => setViewType("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewType === "list" ? "secondary" : "ghost"} 
              size="icon" 
              onClick={() => setViewType("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Sort by <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
              <DropdownMenuItem>Popularity</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={viewType === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {products.map((product) => (
          <ProductCard key={product._id || product.slug} product={product} />
        ))}
      </div>

      <div className="flex justify-center pt-12">
        <Button variant="outline" size="lg">Load More Products</Button>
      </div>
    </>
  );
}
