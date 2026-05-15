"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, ShoppingBag, Tag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock cart items (in real app, these would come from Redux or Context)
  const items = [
    { id: 1, name: "Premium Leather Bag", price: 120, quantity: 1, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" },
    { id: 2, name: "Organic T-Shirt", price: 25, quantity: 2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80" },
  ];

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal + tax - discount);

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      setLoading(true);
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
      } else {
        alert(data.error || "Failed to apply coupon");
      }
    } catch (error) {
      console.error("Coupon application error:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-5xl font-black tracking-tight mb-12">Shopping Bag</h1>

      <div className="grid lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-8 p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all hover:shadow-xl hover:shadow-zinc-200/20">
              <div className="relative w-full sm:w-32 aspect-square rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">{item.name}</h3>
                    <p className="text-zinc-500 font-medium">${item.price.toFixed(2)} each</p>
                  </div>
                  <p className="font-black text-2xl text-blue-600">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"><Minus className="h-4 w-4" /></Button>
                    <span className="w-12 text-center text-lg font-black">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-24 space-y-6 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                <ShoppingBag size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">Your bag is empty</h2>
                <p className="text-zinc-500">Looks like you haven't added anything yet.</p>
              </div>
              <Button asChild className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="text-2xl font-black">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-zinc-500 font-medium">Subtotal</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-zinc-500 font-medium">Shipping</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-zinc-500 font-medium">Tax</span>
                  <span className="font-bold">${tax.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-lg p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30">
                    <div className="flex flex-col">
                      <span className="text-green-700 dark:text-green-400 font-bold flex items-center gap-2">
                        <Tag size={16} />
                        Coupon: {appliedCoupon.code}
                      </span>
                      <button onClick={removeCoupon} className="text-xs text-rose-500 hover:underline mt-1 flex items-center gap-1">
                        <X size={10} /> Remove
                      </button>
                    </div>
                    <span className="font-black text-green-700 dark:text-green-400">-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator className="bg-zinc-100 dark:bg-zinc-800" />
              
              <div className="flex justify-between text-3xl font-black text-zinc-900 dark:text-zinc-100">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3 pt-4">
                <Label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Coupon Code</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter code" 
                    className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button 
                    variant="secondary" 
                    className="h-12 rounded-xl px-6 font-bold"
                    onClick={applyCoupon}
                    disabled={loading || !couponCode}
                  >
                    {loading ? "..." : "Apply"}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pb-8">
              <Button className="w-full h-16 text-xl font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95" asChild>
                <Link href="/checkout">Checkout Now</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
