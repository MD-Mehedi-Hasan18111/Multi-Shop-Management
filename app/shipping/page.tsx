import { Metadata } from "next";
import { Truck, Clock, Globe, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Learn about our shipping methods, delivery times, and costs.",
};

export default function ShippingPage() {
  const policies = [
    {
      icon: Truck,
      title: "Free Standard Shipping",
      desc: "Free shipping on all orders over ৳5000. Standard delivery takes 2-3 business days.",
    },
    {
      icon: Clock,
      title: "Express Shipping",
      desc: "Need it faster? Express delivery within Chattogram delivers in 1-2 business days for a flat ৳100 fee.",
    },
    {
      icon: Globe,
      title: "National Shipping",
      desc: "We ship nationwide! National orders typically arrive within 3-7 business days.",
    },
    {
      icon: Package,
      title: "Order Tracking",
      desc: "Every order comes with a tracking link. Monitor your delivery in real-time from your account.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight">Shipping Policy</h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Fast, reliable delivery for all your orders.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {policies.map((policy) => (
          <div key={policy.title} className="flex gap-4 p-6 rounded-2xl bg-muted/50 border">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <policy.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{policy.title}</h3>
              <p className="text-muted-foreground">{policy.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <h2 className="text-2xl font-bold">Processing Time</h2>
        <p className="text-muted-foreground">
          Orders are processed within 1-2 business days. You will receive a confirmation email
          with tracking details once your order has shipped. During peak seasons, processing
          may take an additional day.
        </p>

        <h2 className="text-2xl font-bold">Delivery Issues</h2>
        <p className="text-muted-foreground">
          If your package has not arrived within the expected timeframe, please contact our
          support team at mdmehedihasan18111@gmail.com. We will investigate and resolve the issue.
        </p>
      </div>
    </div>
  );
}
