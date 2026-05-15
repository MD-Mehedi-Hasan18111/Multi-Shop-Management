import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { ProductCard } from "@/components/site/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Flame, Percent, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Deals",
  description: "Check out our best deals and discounts on premium products.",
};

export default async function DealsPage() {
  await dbConnect();

  // Fetch products that have a comparePrice (i.e., products on sale)
  const dealsData = await Product.find({
    isActive: true,
    comparePrice: { $exists: true, $gt: 0 },
    $expr: { $gt: ["$comparePrice", "$price"] },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const deals = JSON.parse(JSON.stringify(dealsData));

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-orange-500 to-amber-500 p-10 md:p-16 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8" />
            <Badge className="bg-white/20 text-white border-none text-sm">Hot Deals</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Unbeatable Deals
          </h1>
          <p className="text-lg text-white/80 max-w-lg">
            Save big on our hand-picked selection of discounted products. Limited time offers you don&apos;t want to miss!
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Percent className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-2xl font-black">{deals.length}</p>
            <p className="text-sm text-muted-foreground">Active Deals</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Flame className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-black">Up to 50%</p>
            <p className="text-sm text-muted-foreground">Savings</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-black">Limited</p>
            <p className="text-sm text-muted-foreground">Time Offers</p>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight">All Deals</h2>
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 space-y-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <Percent size={40} />
            </div>
            <h2 className="text-2xl font-black">No deals available right now</h2>
            <p className="text-muted-foreground">Check back soon for amazing discounts!</p>
          </div>
        )}
      </section>
    </div>
  );
}
