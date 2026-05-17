import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";
import ShopSettings from "@/models/ShopSettings";
import AppSettings from "@/models/AppSettings";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Shop Manager - Your one-stop shop for everything premium.",
};

export default async function Home() {
  await dbConnect();
  
  // Ensure models are registered (Next.js can sometimes tree-shake unused imports)
  const _models = { Product, Category, User, ShopSettings, AppSettings };

  // Fetch global admin app settings for dynamic sections
  let appSettings = await AppSettings.findOne().lean();
  if (!appSettings) {
    appSettings = await AppSettings.create({});
  }
  const appSettingsClean = appSettings ? JSON.parse(JSON.stringify(appSettings)) : null;

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

  const { attachShopInfo } = await import("@/lib/shop-utils");
  const featuredWithShop = await attachShopInfo(featuredData);
  const latestWithShop = await attachShopInfo(latestData);

  const featuredProducts = JSON.parse(JSON.stringify(featuredWithShop));
  const latestProducts = JSON.parse(JSON.stringify(latestWithShop));

  // If we don't have enough latest, reuse featured reversed
  const latestToShow = latestProducts.length > 0 ? latestProducts : [...featuredProducts].reverse();

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      <Hero settings={appSettingsClean} />
      
      {/* Dynamic Benefits Section */}
      <section className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(appSettingsClean?.homepage?.features || [
            { title: "Free Shipping", icon: "Truck", description: "On all orders over BDT 1000" },
            { title: "24/7 Support", icon: "Clock", description: "Dedicated customer service" },
            { title: "Secure Payment", icon: "Shield", description: "100% secure payment gateway" }
          ]).map((feature: any, index: number) => {
            // Safely resolve Lucide icons dynamically
            const IconComponent = (() => {
              switch (feature.icon?.toLowerCase()) {
                case "truck": return require("lucide-react").Truck;
                case "clock": return require("lucide-react").Clock;
                case "shield": return require("lucide-react").Shield;
                case "creditcard": return require("lucide-react").CreditCard;
                case "star": return require("lucide-react").Star;
                case "thumbsup": return require("lucide-react").ThumbsUp;
                case "shoppingbag": return require("lucide-react").ShoppingBag;
                case "gift": return require("lucide-react").Gift;
                default: return require("lucide-react").Sparkles;
              }
            })();

            return (
              <div key={index} className="flex gap-4 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-zinc-950 dark:text-zinc-50">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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

      {/* Dynamic Promo Section */}
      {appSettingsClean?.homepage?.promoTitle ? (
        <section className="bg-primary/5 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-zinc-100 dark:border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-6">
              {appSettingsClean.homepage.promoDiscount && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground tracking-wider uppercase">
                  {appSettingsClean.homepage.promoDiscount}
                </span>
              )}
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">{appSettingsClean.homepage.promoTitle}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {appSettingsClean.homepage.promoDescription}
              </p>
              <Link href={appSettingsClean.homepage.promoBtnLink || "/deals"}>
                <Button size="lg" className="px-8 font-bold rounded-xl mt-2">{appSettingsClean.homepage.promoBtnText || "Get the Deal"}</Button>
              </Link>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden border shadow-2xl bg-zinc-100 dark:bg-zinc-950">
              {appSettingsClean.homepage.promoBannerImage ? (
                <img src={appSettingsClean.homepage.promoBannerImage} alt="Promo Banner" className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-4xl text-primary/40 uppercase tracking-widest italic">
                    PROMO BANNER
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      ) : (
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
      )}

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
