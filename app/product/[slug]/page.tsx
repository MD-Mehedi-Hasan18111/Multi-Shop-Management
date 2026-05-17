import Image from "next/image";
import { Star, Package, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import dynamic from "next/dynamic";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailsClient from "@/components/site/ProductDetailsClient";
import { Metadata } from "next";
import { IProduct } from "@/types/product";
import { Button } from "@/components/ui/button";


// Dynamic import for ReviewSection to reduce initial bundle size
const ReviewSection = dynamic(() => import("@/components/site/ReviewSection"), {
  loading: () => <div className="h-64 bg-zinc-50 animate-pulse rounded-2xl" />,
  ssr: false,
});

export const revalidate = 3600; // ISR: Revalidate every hour

export async function generateStaticParams() {
  await dbConnect();
  const products = await Product.find({}, { slug: 1 }).lean() as unknown as IProduct[];
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await dbConnect();
  const product = await Product.findOne({ slug: params.slug }).lean() as unknown as IProduct;

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  await dbConnect();
  const productData = await Product.findOne({ slug: params.slug }).lean() as unknown as IProduct;


  if (!productData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-zinc-300 mb-4" />
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/products" className="text-blue-600 hover:underline">Back to shop</Link>
      </div>
    );
  }

  // Convert MongoDB document to plain object for client component
  const { attachShopInfo } = await import("@/lib/shop-utils");
  const [productWithShop] = await attachShopInfo([productData]);
  const product = JSON.parse(JSON.stringify(productWithShop));

  if (product.shop?.isBlocked === true) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-6 min-h-[calc(100vh-15rem)] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-600 shadow-xl shadow-red-200/50 dark:shadow-none">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 italic">Product Not Available</h1>
        <p className="text-zinc-500 max-w-md mx-auto font-medium">The product &quot;{product.name}&quot; belongs to a shop that is currently disabled or not available. Please explore other available products.</p>
        <div className="pt-4">
          <Button asChild className="rounded-full px-8 h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700">
            <Link href="/products">Browse Other Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.barcode || product._id,
    "brand": {
      "@type": "Brand",
      "name": "Shop Manager"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://your-domain.com/product/${product.slug}`,
      "priceCurrency": "USD",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.averageRating || 5,
      "reviewCount": product.reviewCount || 1
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-zinc-50 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                <Package size={80} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images?.slice(0, 4).map((img: any, i: any) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all bg-zinc-50">
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

        </div>

        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {product.shop && (
                <Link
                  href={`/shops/${product.shop.slug || product.shop._id}`}
                  className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-2xl group border border-transparent hover:border-blue-500 transition-all"
                >
                  {product.shop.logo && (
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src={product.shop.logo} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-blue-600 transition-colors">
                    {product.shop.shopName}
                  </span>
                </Link>
              )}
              <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-3 py-1 rounded-full">New Arrival</Badge>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{product.averageRating?.toFixed(1) || "0.0"}</span>
                <span className="text-zinc-500 font-medium">({product.reviewCount || 0} reviews)</span>
              </div>
              {product.stock <= (product.lowStockThreshold || 5) && (
                <Badge variant="destructive" className="animate-pulse">Only {product.stock} left!</Badge>
              )}
            </div>
            <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
              {product.comparePrice && (
                <span className="text-2xl text-zinc-400 line-through decoration-zinc-300">${product.comparePrice.toFixed(2)}</span>
              )}
            </div>
          </div>

          <p className="text-zinc-600 dark:text-zinc-400 text-xl leading-relaxed">
            {product.description}
          </p>

          <ProductDetailsClient product={product} />
        </div>
      </div>

      <div className="mt-24">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start gap-4 lg:gap-8 border-b border-zinc-100 dark:border-zinc-800 rounded-none bg-transparent h-14 p-0 overflow-x-auto overflow-y-hidden no-scrollbar">
            <TabsTrigger value="description" className="text-lg font-bold data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-4 bg-transparent shadow-none">Description</TabsTrigger>
            <TabsTrigger value="reviews" className="text-lg font-bold data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-4 bg-transparent shadow-none">Reviews</TabsTrigger>
            <TabsTrigger value="shipping" className="text-lg font-bold data-[state=active]:text-blue-600 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none px-4 bg-transparent shadow-none">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-12 space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-2xl font-bold mb-4">Product Details</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">{product.description}</p>
              {product.barcode && (
                <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                  <Package size={16} />
                  <span>Barcode: {product.barcode}</span>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="py-12">
            <ReviewSection productId={product._id} />
          </TabsContent>
          <TabsContent value="shipping" className="py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Standard shipping takes 3-5 business days. Returns are accepted within 30 days of purchase.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
