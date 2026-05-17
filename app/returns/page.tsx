import { Metadata } from "next";
import { RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Learn about our returns and refund policy.",
};

export default function ReturnsPage() {
  const steps = [
    { icon: RotateCcw, title: "Initiate Return", desc: "Contact us within 2 days of receiving your order to start a return." },
    { icon: Clock, title: "Return Item", desc: "Return the item within 5 days of contacting us." },
    { icon: CheckCircle, title: "Get Refunded", desc: "Once we receive and inspect the item, your refund is processed within 2-3 business days." },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tight">Returns & Refunds</h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Hassle-free returns within 7 days of delivery.
        </p>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={step.title} className="text-center space-y-4 p-6 rounded-2xl bg-muted/50 border">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <step.icon className="h-8 w-8 text-primary" />
            </div>
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {i + 1}
            </div>
            <h3 className="font-bold text-lg">{step.title}</h3>
            <p className="text-muted-foreground text-sm">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <h2 className="text-2xl font-bold">Eligibility</h2>
        <p className="text-muted-foreground">
          Items must be unused, in their original packaging, and in the same condition you received them.
          Certain products like perishables, custom items, and personal care products cannot be returned.
        </p>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200 m-0">
            Sale items and items marked as final sale are not eligible for returns or refunds.
          </p>
        </div>

        <h2 className="text-2xl font-bold">Exchanges</h2>
        <p className="text-muted-foreground">
          We only replace items if they are defective or damaged. If you need to exchange an item
          for the same product, contact us at support@shopmanager.com.
        </p>
      </div>
    </div>
  );
}
