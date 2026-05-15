"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/redux/store";
import { clearCart } from "@/lib/redux/cartSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Truck, ShieldCheck, Banknote, Loader2, ShoppingBag, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    if (!form.firstName || !form.lastName || !form.address || !form.city || !form.zipCode || !form.phone) {
      setError("Please fill in all shipping details.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            product: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            address: form.address,
            city: form.city,
            zipCode: form.zipCode,
            phone: form.phone,
          },
          paymentMethod: "cod",
          subtotal,
          tax,
          total,
        }),
      });

      if (res.ok) {
        dispatch(clearCart());
        router.push("/tracking");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to place order");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-black">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some products before checking out.</p>
        <Button asChild className="h-12 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-center">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="h-6 w-6" /> Shipping Details
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Address</Label>
                <Input name="address" placeholder="123 Street Address" value={form.address} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input name="city" placeholder="New York" value={form.city} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input name="zipCode" placeholder="10001" value={form.zipCode} onChange={handleChange} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Phone Number</Label>
                <Input name="phone" placeholder="+1 234 567 890" value={form.phone} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* Payment Method — Cash on Delivery only */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Banknote className="h-6 w-6" /> Payment Method
            </h2>
            <div className="flex items-center gap-4 p-6 rounded-2xl border-2 border-primary bg-primary/5">
              <div className="w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-3xl">💵</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold">Cash on Delivery</p>
                <p className="text-sm text-muted-foreground">Pay when your order arrives at your doorstep</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </section>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-2 border-primary/10">
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure encrypted checkout
              </div>
              <Button
                className="w-full py-6 font-bold text-lg"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
