"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Truck, Package, Clock, ShieldCheck } from "lucide-react";

const steps = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "paid", label: "Payment Confirmed", icon: CheckCircle2 },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: ShieldCheck },
];

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch for tracking
    setTimeout(() => {
      setOrder({
        orderNumber: params.orderId,
        status: "processing",
        updatedAt: new Date().toLocaleDateString(),
      });
      setLoading(false);
    }, 1000);
  }, [params.orderId]);

  if (loading) return <div className="container py-20 text-center">Loading tracker...</div>;

  const currentStepIndex = steps.findIndex((s) => s.status === order?.status);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Track Your Order</CardTitle>
          <CardDescription>Order ID: {order?.orderNumber}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-12 py-8">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-500" 
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                return (
                  <div key={step.status} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 bg-background z-10 ${
                      isCompleted ? "border-primary text-primary" : "border-muted text-muted-foreground"
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-bold ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-muted/50 p-6 rounded-2xl space-y-4">
             <div className="flex justify-between items-center">
                <span className="font-medium">Current Status</span>
                <Badge className="capitalize text-lg px-4 py-1">{order?.status}</Badge>
             </div>
             <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Last Updated</span>
                <span>{order?.updatedAt}</span>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
