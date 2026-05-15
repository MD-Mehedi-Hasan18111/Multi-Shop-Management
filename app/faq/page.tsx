import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Shop Manager.",
};

const faqs = [
  {
    question: "How do I create an account?",
    answer: "Click the user icon in the top navigation bar and select 'Create Account'. Fill in your details and you're good to go!",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days. Express shipping delivers in 2-3 business days. International orders may take 10-15 business days.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept Cash on Delivery (COD). Pay conveniently when your order arrives at your doorstep.",
  },
  {
    question: "Can I return or exchange an item?",
    answer: "Yes! You can return unused items within 30 days of purchase. Visit our Returns & Refunds page for full details.",
  },
  {
    question: "How do I track my order?",
    answer: "Go to My Account → My Orders to see all your orders and their current status. Each order has a detailed tracking page.",
  },
  {
    question: "How can I become a shopkeeper?",
    answer: "Contact our admin team to apply for a shopkeeper account. Once approved, you'll get access to the full shopkeeper dashboard to manage products, orders, and analytics.",
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. We use industry-standard encryption and never share your data with third parties. Your privacy is our priority.",
  },
  {
    question: "How do I apply a coupon code?",
    answer: "Add items to your cart, then enter the coupon code in the 'Coupon Code' field on the cart page and click 'Apply'. The discount will be reflected in your total.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl space-y-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-5xl font-black tracking-tight">FAQs</h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Find answers to the most commonly asked questions.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border rounded-2xl px-6 data-[state=open]:bg-muted/50"
          >
            <AccordionTrigger className="text-left font-bold text-base hover:no-underline py-5">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-5">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="text-center p-8 rounded-2xl bg-muted/50 border space-y-4">
        <h3 className="text-xl font-bold">Still have questions?</h3>
        <p className="text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Reach out to our support team.
        </p>
        <a href="/contact" className="inline-flex items-center justify-center h-12 px-8 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Contact Support
        </a>
      </div>
    </div>
  );
}
