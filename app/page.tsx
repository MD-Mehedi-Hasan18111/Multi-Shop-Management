import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Shop Manager - Your one-stop shop for everything premium.",
};

const MOCK_PRODUCTS = [

  { name: "Premium Leather Bag", slug: "premium-leather-bag", price: 120, comparePrice: 150, images: [], stock: 10 },
  { name: "Wireless Headphones", slug: "wireless-headphones", price: 199, images: [], stock: 5 },
  { name: "Organic T-Shirt", slug: "organic-t-shirt", price: 25, images: [], stock: 100 },
  { name: "Ceramic Coffee Mug", slug: "ceramic-coffee-mug", price: 15, images: [], stock: 50 },
];

export default function Home() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard key={product.slug} product={product as any} />
          ))}

        </div>
      </section>

      <section className="bg-primary/5 rounded-2xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight">Summer Sale Up to 50% Off!</h2>
            <p className="text-lg text-muted-foreground">
              Don't miss out on our biggest sale of the season. Grab your favorites at unbeatable prices.
            </p>
            <Button size="lg" className="px-8">Get the Deal</Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.reverse().map((product) => (
            <ProductCard key={product.slug} product={product as any} />
          ))}

        </div>
      </section>
    </div>
  );
}
