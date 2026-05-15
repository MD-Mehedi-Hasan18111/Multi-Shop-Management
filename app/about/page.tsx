import { Metadata } from "next";
import { Store, Users, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Shop Manager and our mission.",
};

export default function AboutPage() {
  const values = [
    { icon: Award, title: "Quality First", desc: "We curate only the finest products from trusted sellers." },
    { icon: Users, title: "Community Driven", desc: "Built by shopkeepers, for shopkeepers and their customers." },
    { icon: Globe, title: "Global Reach", desc: "Connecting local businesses with customers everywhere." },
    { icon: Store, title: "Multi-Tenant", desc: "Every shopkeeper gets their own storefront and management tools." },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">
      {/* Hero */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
          About <span className="text-primary">ShopManager</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We&apos;re building the future of multi-tenant e-commerce — empowering shopkeepers 
          and delighting customers with a seamless shopping experience.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-white">
        <h2 className="text-3xl font-black mb-4">Our Mission</h2>
        <p className="text-lg text-white/80 max-w-3xl">
          To democratize e-commerce by providing small and medium businesses with enterprise-grade 
          tools to manage their shops, reach new customers, and grow their revenue — all from one 
          unified platform.
        </p>
      </div>

      {/* Values */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Our Values</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value) => (
            <div key={value.title} className="flex gap-4 p-6 rounded-2xl bg-muted/50 border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{value.title}</h3>
                <p className="text-muted-foreground">{value.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
