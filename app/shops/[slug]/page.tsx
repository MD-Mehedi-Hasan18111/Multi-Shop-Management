import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";
import Product from "@/models/Product";
import { ProductCard } from "@/components/site/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Store, Package, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await dbConnect();
  const shop = await ShopSettings.findOne({ slug: params.slug }).lean() as any;
  return {
    title: shop?.shopName || "Shop Details",
    description: shop?.aboutText || "Browse products from this shop.",
  };
}

export default async function ShopDetailsPage({ params }: { params: { slug: string } }) {
  await dbConnect();

  const shopData = await ShopSettings.findOne({ slug: params.slug }).lean();
  if (!shopData) {
    // Try by ID if slug not found
    const shopById = await ShopSettings.findById(params.slug).lean();
    if (!shopById) return notFound();
    return <ShopDetailsPage params={{ slug: (shopById as any).slug }} />;
  }

  const shop = JSON.parse(JSON.stringify(shopData));

  // Fetch products for this shop
  const productsData = await Product.find({ shopkeeper: shop.shopkeeper, isActive: true })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const products = JSON.parse(JSON.stringify(productsData));

  return (
    <div className="space-y-0 relative">
      {/* Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button variant="secondary" size="sm" asChild className="rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border-white/20 text-white font-bold">
          <Link href="/shops" className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Shops
          </Link>
        </Button>
      </div>

      {/* Banner Section */}
      <div className="relative h-[40vh] min-h-[300px] bg-zinc-900 overflow-hidden">
        {shop.bannerImages?.[0] ? (
          <img src={shop.bannerImages[0]} alt="" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full">
          <div className="container mx-auto px-4 pb-12">
            <div className="flex flex-col md:flex-row items-end gap-8">
              <div className="relative w-40 h-40 rounded-[2.5rem] bg-white dark:bg-zinc-800 p-1.5 shadow-2xl ring-8 ring-black/10">
                <div className="w-full h-full rounded-[2rem] bg-zinc-50 dark:bg-zinc-700 flex items-center justify-center overflow-hidden">
                  {shop.logo ? (
                    <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={48} className="text-zinc-300" />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-4 pb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-blue-600 hover:bg-blue-600">Verified Partner</Badge>
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Package size={14} /> {products.length} Products
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase">
                  {shop.shopName}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Left: About & Contact */}
          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span className="w-8 h-1 bg-primary rounded-full" />
                About Us
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg italic">
                &quot;{shop.aboutText || "This shopkeeper hasn't provided a description yet."}&quot;
              </p>
            </section>

            <section className="space-y-6 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[2rem]">
              <h2 className="text-xl font-bold tracking-tight">Contact Information</h2>
              <div className="space-y-4">
                {shop.contactInfo?.email && (
                  <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Mail size={18} />
                    </div>
                    <span>{shop.contactInfo.email}</span>
                  </div>
                )}
                {shop.contactInfo?.phone && (
                  <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 group">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Phone size={18} />
                    </div>
                    <span>{shop.contactInfo.phone}</span>
                  </div>
                )}
                {shop.contactInfo?.address && (
                  <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 group">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <MapPin size={18} />
                    </div>
                    <span>{shop.contactInfo.address}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-4">
                {shop.socialLinks?.facebook && (
                  <a href={shop.socialLinks.facebook} target="_blank" className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Facebook size={20} />
                  </a>
                )}
                {shop.socialLinks?.instagram && (
                  <a href={shop.socialLinks.instagram} target="_blank" className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Instagram size={20} />
                  </a>
                )}
                {shop.socialLinks?.twitter && (
                  <a href={shop.socialLinks.twitter} target="_blank" className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Twitter size={20} />
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* Right: Products */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight">Our Collection</h2>
              <Badge variant="outline" className="px-4 py-1 text-sm font-bold border-zinc-200">{products.length} Items</Badge>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed">
                <Package size={64} className="mx-auto text-zinc-300" />
                <h2 className="text-2xl font-bold">No products yet</h2>
                <p className="text-zinc-500">This shop hasn&apos;t listed any items for sale yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
