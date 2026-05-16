import { Metadata } from "next";
import { Suspense } from "react";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ShopSettings from "@/models/ShopSettings";
import ProductsListClient from "@/components/site/ProductsListClient";

export const metadata: Metadata = {
  title: "All Products | Shop Manager",
  description: "Browse our extensive collection of premium products from various shops and categories.",
};

export default async function ProductsPage() {
  await dbConnect();
  
  // Fetch initial products, categories and shops on the server
  const productsData = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .populate("category", "name slug")
    .lean();
    
  const categoriesData = await Category.find({}).lean();
  const shopsData = await ShopSettings.find({}, { shopName: 1, _id: 1, slug: 1 }).lean();

  const { attachShopInfo } = await import("@/lib/shop-utils");
  const productsWithShop = await attachShopInfo(productsData);

  const products = JSON.parse(JSON.stringify(productsWithShop));
  const categories = JSON.parse(JSON.stringify(categoriesData));
  const shops = JSON.parse(JSON.stringify(shopsData));

  return (
    <div className="bg-zinc-50/50 min-h-screen">
      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-7xl">
        <div className="space-y-2 mb-12">
          <h1 className="text-5xl font-black tracking-tight italic uppercase text-zinc-900">Explore Products</h1>
          <p className="text-zinc-500 text-lg font-medium">Discover unique products from premium local shops.</p>
        </div>
        
        <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading products...</div>}>
          <ProductsListClient 
            initialProducts={products} 
            categories={categories}
            shops={shops}
          />
        </Suspense>
      </div>
    </div>
  );
}
