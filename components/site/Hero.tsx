"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  settings?: {
    bannerImages?: string[];
    shopName?: string;
    homepage?: {
      heroTitle?: string;
      heroDescription?: string;
      heroBtnText?: string;
      heroBtnLink?: string;
    };
  };
}

export function Hero({ settings }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = settings?.bannerImages && settings.bannerImages.length > 0
    ? settings.bannerImages
    : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"];

  const hasSlider = images.length > 1;

  useEffect(() => {
    if (!hasSlider) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasSlider, images.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-2xl bg-muted group">
      {/* Background Images */}
      {hasSlider ? (
        <div className="absolute inset-0 w-full h-full">
          {images.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === activeIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
                }`}
            >
              <Image
                src={img}
                alt={`Hero Banner ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <Image
          src={images[0]}
          alt="Hero Banner"
          fill
          className="object-cover"
          priority
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/35 z-10 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 container mx-auto px-4 flex flex-col items-center justify-center text-center text-white space-y-6 z-20">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-4xl drop-shadow-sm">
          {settings?.homepage?.heroTitle || settings?.shopName || "Summer Collection 2024"}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl opacity-90 leading-relaxed font-medium drop-shadow-sm">
          {settings?.homepage?.heroDescription || "Discover our new arrivals and exclusive deals. Elevate your style with our premium selected items."}
        </p>
        <div className="flex gap-4 pt-2">
          <Link href={settings?.homepage?.heroBtnLink || "/products"}>
            <Button size="lg" className="px-8 font-bold bg-white text-zinc-950 hover:bg-white/90 rounded-xl shadow-lg shadow-white/10">{settings?.homepage?.heroBtnText || "Shop Now"}</Button>
          </Link>
          <Link href="/categories">
            <Button size="lg" variant="outline" className="px-8 font-bold bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 text-white rounded-xl">
              Categories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Slider Controls */}
      {hasSlider && (
        <>
          {/* Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/80"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          {/* <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-black/25 backdrop-blur-sm hover:bg-black/50 text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-105 z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button> */}
        </>
      )}
    </div>
  );
}
