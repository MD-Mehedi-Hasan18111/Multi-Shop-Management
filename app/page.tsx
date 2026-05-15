import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Shop Manager - Your one-stop shop for everything premium.",
};

export default async function Home() {
  await dbConnect();

  // Fetch featured products from DB
  const featuredData = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate("category", "name slug")
    .lean();

  // Fetch latest arrivals (different sort or skip)
  const latestData = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .skip(4)
    .limit(4)
    .populate("category", "name slug")
    .lean();

  const featuredProducts = JSON.parse(JSON.stringify(featuredData));
  const latestProducts = JSON.parse(JSON.stringify(latestData));

  // If we don't have enough latest, reuse featured reversed
  const latestToShow = latestProducts.length > 0 ? latestProducts : [...featuredProducts].reverse();

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      <Hero />
      
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked selection of our best items.</p>
          </div>
          <Link href="/products">
            <Button variant="ghost">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold">No products yet</h3>
            <p className="text-muted-foreground">Products will appear here once added by shopkeepers.</p>
          </div>
        )}
      </section>

      <section className="bg-primary/5 rounded-2xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight">Summer Sale Up to 50% Off!</h2>
            <p className="text-lg text-muted-foreground">
              Don&apos;t miss out on our biggest sale of the season. Grab your favorites at unbeatable prices.
            </p>
            <Link href="/deals">
              <Button size="lg" className="px-8">Get the Deal</Button>
            </Link>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden border shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
             <div className="absolute inset-0 flex items-center justify-center font-bold text-4xl text-primary/40">
                PROMO BANNER
             </div>
          </div>
        </div>
      </section>

      <section className="space-y-8 pb-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Latest Arrivals</h2>
          <p className="text-muted-foreground">Fresh styles just landed in our shop.</p>
        </div>
        {latestToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestToShow.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-bold">No new arrivals yet</h3>
            <p className="text-muted-foreground">Check back soon for new products.</p>
          </div>
        )}
      </section>
    </div>
  );
}
