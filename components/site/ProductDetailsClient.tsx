"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Heart, Share2, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { IProduct } from "@/types/product";

import { useDispatch, useSelector } from "react-redux";
import { addItem } from "@/lib/redux/cartSlice";
import { toggleWishlist as toggleWishlistAction } from "@/lib/redux/wishlistSlice";
import { RootState } from "@/lib/redux/store";
import { cn } from "@/lib/utils";

interface ProductDetailsClientProps {
  product: IProduct;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const inWishlist = wishlistItems.some((item) => item.id === product._id);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some((item) => item.id === product._id);

  const toggleWishlist = async () => {
    if (!session) return alert("Please log in to manage your wishlist");

    try {
      if (inWishlist) {
        await fetch(`/api/wishlist/${product._id}`, { method: "DELETE" });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
      }

      dispatch(toggleWishlistAction({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        slug: product.slug || ""
      }));
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    dispatch(addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      quantity: quantity,
      slug: product.slug
    }));
  };

  return (
    <>
      <div className="space-y-6 pt-4">
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-12 w-12 hover:bg-white dark:hover:bg-zinc-700"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >-</Button>
            <span className="w-16 text-center font-black text-lg">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-12 w-12 hover:bg-white dark:hover:bg-zinc-700"
              onClick={() => setQuantity(quantity + 1)}
            >+</Button>
          </div>
          <Button 
            size="lg" 
            className={cn("flex-1 font-black text-lg h-14 rounded-2xl shadow-xl transition-all", 
              isInCart ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
            )}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isInCart}
          >
            <ShoppingCart className="mr-3 h-6 w-6" /> 
            {product.stock === 0 ? "Out of Stock" : isInCart ? "Already in Cart" : "Add to Cart"}
          </Button>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className={`flex-1 h-12 rounded-xl font-bold border-2 ${inWishlist ? "bg-rose-50 border-rose-200 text-rose-500" : ""}`}
            onClick={toggleWishlist}
          >
            <Heart className={`mr-2 h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
            {inWishlist ? "In Wishlist" : "Wishlist"}
          </Button>
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-2">
            <Share2 className="mr-2 h-5 w-5" /> Share
          </Button>
        </div>
      </div>

      <Separator className="bg-zinc-100 dark:bg-zinc-800" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold">Free Shipping</h4>
            <p className="text-sm text-zinc-500">On orders over $100</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold">Secure Payment</h4>
            <p className="text-sm text-zinc-500">100% secure checkout</p>
          </div>
        </div>
      </div>
    </>
  );
}
