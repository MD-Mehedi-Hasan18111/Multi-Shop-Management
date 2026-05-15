import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  settings?: {
    bannerImages?: string[];
    shopName?: string;
  };
}


export function Hero({ settings }: HeroProps) {
  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-xl bg-muted">
      <Image
        src={settings?.bannerImages?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"}
        alt="Hero Banner"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 container mx-auto px-4 flex flex-col items-center justify-center text-center text-white space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          {settings?.shopName || "Summer Collection 2024"}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl opacity-90">
          Discover our new arrivals and exclusive deals. Elevate your style with our premium selected items.
        </p>
        <div className="flex gap-4">
          <Link href="/products">
            <Button size="lg" className="px-8 font-bold">Shop Now</Button>
          </Link>
          <Link href="/categories">
            <Button size="lg" variant="outline" className="px-8 font-bold bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 text-white">
              Categories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
