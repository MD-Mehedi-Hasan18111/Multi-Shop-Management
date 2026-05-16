"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Truck, Package, Clock, ShieldCheck, ArrowLeft, MapPin, Phone, User, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: ShieldCheck },
];

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground font-medium">Fetching order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle size={40} />
        </div>
        <h1 className="text-3xl font-bold">Order Not Found</h1>
        <p className="text-zinc-500">We couldn't find the order you're looking for.</p>
        <Button asChild variant="outline">
          <Link href="/account/orders">Back to My Orders</Link>
        </Button>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account/orders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.orderNumber || order._id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Tracking Stepper */}
          <Card className="border-none shadow-xl shadow-zinc-200/50 rounded-[2.5rem]">
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
            </CardHeader>
            <CardContent className="py-8">
              {isCancelled ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700">
                  <XCircle size={32} />
                  <div>
                    <p className="font-bold">Order Cancelled</p>
                    <p className="text-sm opacity-80">This order was cancelled and will not be delivered.</p>
                  </div>
                </div>
              ) : (
                <div className="relative pt-4">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-[5%] w-[90%] h-1 bg-muted" />
                  <div
                    className="absolute top-5 left-[5%] h-1 bg-primary transition-all duration-700"
                    style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 90 : 0}%` }}
                  />

                  <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      return (
                        <div key={step.status} className="flex flex-col items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-background z-10 transition-all duration-500 ${isCompleted ? "border-primary text-primary scale-110 shadow-lg shadow-primary/20" : "border-muted text-muted-foreground"
                            } ${isCurrent ? "animate-pulse ring-4 ring-primary/10" : ""}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`text-[10px] uppercase tracking-widest font-black ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="border-none shadow-xl shadow-zinc-200/50 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
              <CardTitle className="flex items-center gap-2">
                <Receipt size={20} className="text-blue-600" /> Items Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-6 hover:bg-zinc-50/50 transition-colors">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-zinc-400 overflow-hidden border">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity} × BDT {item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-600">BDT {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 bg-zinc-50/50 space-y-3">
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Subtotal</span>
                  <span>BDT {order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-zinc-900 pt-3 border-t">
                  <span>Total</span>
                  <span>BDT {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Customer & Address */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-zinc-200/50 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Customer</p>
                  <p className="font-bold">{order.shippingAddress?.name || "Guest User"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Contact</p>
                  <p className="font-bold">{order.shippingAddress?.phone || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-zinc-200/50 rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-lg">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-zinc-700 leading-relaxed">
                  {order.shippingAddress?.street}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-zinc-200/50 rounded-[2rem] bg-white text-black">
            <CardContent className="p-8 space-y-4">
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Payment Information</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="font-bold capitalize">{order.paymentMethod === 'cod' ? "Cash on Delivery" : order.paymentMethod}</p>
                  <p className="text-xs text-zinc-500">Secure Payment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
