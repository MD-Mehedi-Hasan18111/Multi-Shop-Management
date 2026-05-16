import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Store, MapPin, ChevronRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Shops",
  description: "Explore our community of unique shops and brands.",
};

export default async function ShopsPage() {
  await dbConnect();
  const shopsData = await ShopSettings.find({}).lean();
  const shops = JSON.parse(JSON.stringify(shopsData));

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tighter italic uppercase text-zinc-900 dark:text-zinc-100">Our Partner Shops</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">Discover local businesses and global brands all in one place. Shop directly from our curated list of partners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shops.map((shop: any) => (
          <Link key={shop._id} href={`/shops/${shop.slug || shop._id}`}>
            <Card className="group border-none shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white dark:bg-zinc-900 ring-1 ring-zinc-100 dark:ring-zinc-800">
              <div className="aspect-[2/1] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 relative overflow-hidden">
                {shop.bannerImages?.[0] ? (
                  <img src={shop.bannerImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <Store size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                <div className="absolute -bottom-8 left-8 w-20 h-20 rounded-3xl bg-white dark:bg-zinc-800 p-1 shadow-2xl ring-4 ring-white dark:ring-zinc-900">
                  <div className="w-full h-full rounded-[1.2rem] bg-zinc-50 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                    {shop.logo ? (
                      <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
                    ) : (
                      <Store size={24} className="text-zinc-400" />
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="pt-12 pb-8 px-8 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">{shop.shopName}</h3>
                    {shop.contactInfo?.address && (
                      <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
                        <MapPin size={14} /> {shop.contactInfo.address}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>

                <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 text-sm leading-relaxed">
                  {shop.aboutText || "No description available for this shop."}
                </p>

                <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">View Store</span>
                  {/* <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-900" />
                      ))}
                   </div> */}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {shops.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed">
            <Store size={64} className="mx-auto text-zinc-300" />
            <h2 className="text-2xl font-bold">No shops registered yet</h2>
            <p className="text-zinc-500">Check back soon for new partner stores.</p>
          </div>
        )}
      </div>
    </div>
  );
}
