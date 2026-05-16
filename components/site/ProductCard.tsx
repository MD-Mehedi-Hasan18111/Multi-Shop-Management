"use client";

import Image from "next/image";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "@/lib/redux/cartSlice";
import { toggleWishlist } from "@/lib/redux/wishlistSlice";
import { RootState } from "@/lib/redux/store";
import { cn } from "@/lib/utils";

import { IProduct } from "@/types/product";
import { useSession } from "next-auth/react";

interface ProductCardProps {
  product: IProduct;
}


export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const isInWishlist = wishlistItems.some((item) => item.id === product._id);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const isInCart = cartItems.some((item) => item.id === product._id);

  const { data: session } = useSession();

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      alert("Please log in to manage your wishlist");
      return;
    }

    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist/${product._id}`, { method: "DELETE" });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
      }

      dispatch(toggleWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "",
        slug: product.slug || ""
      }));
    } catch (error) {
      console.error("Wishlist sync error:", error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    dispatch(addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      quantity: 1,
      slug: product.slug
    }));
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg border-muted/60">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />

          {discount > 0 && (
            <Badge className="absolute top-2 left-2 bg-destructive">{discount}% OFF</Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="secondary" className="absolute inset-0 m-auto h-fit w-fit px-4 py-2 text-lg">
              Out of Stock
            </Badge>
          )}

          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <Button size="icon" variant="secondary" className="rounded-full">
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={cn("rounded-full transition-all", isInWishlist ? "bg-red-50 text-red-600" : "")}
              onClick={handleWishlist}
            >
              <Heart className={cn("h-4 w-4", isInWishlist ? "fill-current" : "")} />
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            {product.category?.name || "Product"}
          </p>
          {product.shop && (
            <Link href={`/shops/${product.shop.slug || product.shop._id}`} className="flex items-center gap-1 group/shop">
              {product.shop.logo && (
                <div className="w-4 h-4 rounded-full overflow-hidden border border-zinc-100">
                  <img src={product.shop.logo} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <span className="text-[10px] font-bold text-zinc-400 group-hover/shop:text-primary transition-colors truncate max-w-[80px]">
                {product.shop.shopName}
              </span>
            </Link>
          )}
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold">BDT {product.price.toFixed(2)}</span>
          {product.comparePrice ? (
            <span className="text-sm text-muted-foreground line-through">
              BDT {product.comparePrice.toFixed(2)}
            </span>
          ) : ''}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className={cn("w-full h-11 rounded-xl font-bold transition-all", 
            isInCart ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          )}
          disabled={product.stock === 0 || isInCart} 
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : isInCart ? "Already in Cart" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
