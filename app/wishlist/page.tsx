"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Heart, ShoppingCart, Trash2, Share2, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
}

interface Wishlist {
  products: Product[];
  shareToken: string;
}

export default function WishlistPage() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchWishlist();
    }
  }, [session]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setWishlist(data);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      setWishlist((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          products: prev.products.filter((p) => p._id !== productId),
        };
      });
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
    }
  };

  const shareWishlist = () => {
    if (wishlist?.shareToken) {
      const url = `${window.location.origin}/wishlist/share/${wishlist.shareToken}`;
      navigator.clipboard.writeText(url);
      alert("Shareable link copied to clipboard!");
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Heart size={64} className="text-zinc-200" />
        <h1 className="text-2xl font-bold">Please log in to see your wishlist</h1>
        <Link href="/api/auth/signin" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-10 w-48 bg-zinc-100 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-zinc-100 rounded-2xl" />)}
      </div>
    </div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart size={32} className="text-rose-500 fill-rose-500" />
            My Wishlist
          </h1>
          <p className="text-zinc-500">Save products you love for later.</p>
        </div>
        {wishlist && wishlist.products.length > 0 && (
          <button 
            onClick={shareWishlist}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Share2 size={16} />
            Share Wishlist
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist?.products.map((product) => (
          <div key={product._id} className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
              {product.images?.[0] ? (
                <Image 
                  src={product.images[0]} 
                  alt={product.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Package size={48} />
                </div>
              )}
              <button 
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{product.name}</h3>
                <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <Link 
                  href={`/products/${product._id}`}
                  className="flex-1 text-center py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  View Details
                </Link>
                <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wishlist?.products.length === 0 && (
        <div className="text-center py-20 space-y-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <Heart size={48} className="mx-auto text-zinc-300" />
          <p className="text-xl font-medium text-zinc-500">Your wishlist is empty.</p>
          <Link href="/products" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-xl font-medium">
            Explore Products
          </Link>
        </div>
      )}
    </div>
  );
}
