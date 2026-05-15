import { Metadata } from "next";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Grid, List, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductsListClient from "@/components/site/ProductsListClient";



export const metadata: Metadata = {
  title: "All Products",
  description: "Browse our extensive collection of premium products.",
};

export default async function ProductsPage() {
  await dbConnect();
  
  // Fetch initial products and categories on the server
  const productsData = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(12).populate("category", "name slug").lean();
  const categoriesData = await Category.find({}).lean();

  const products = JSON.parse(JSON.stringify(productsData));
  const categories = JSON.parse(JSON.stringify(categoriesData));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8 hidden md:block">
          <div>
            <h3 className="font-bold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.length > 0 ? categories.map((cat: { _id: string, slug: string, name: string }) => (
                <div key={cat._id} className="flex items-center space-x-2">
                  <Checkbox id={cat.slug} />
                  <Label htmlFor={cat.slug}>{cat.name}</Label>
                </div>
              )) : (

                ["Electronics", "Fashion", "Home & Living", "Accessories"].map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox id={cat} />
                    <Label htmlFor={cat}>{cat}</Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Price Range</h3>
            <Slider defaultValue={[0, 1000]} max={1000} step={10} className="mt-4" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>$0</span>
              <span>$1000+</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          <ProductsListClient initialProducts={products as any} />
        </main>

      </div>
    </div>
  );
}
