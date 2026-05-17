import { Store, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";
import User from "@/models/User";

export async function Footer() {
  await dbConnect();
  const adminUser = await User.findOne({ role: "admin" });
  let settings = null;
  if (adminUser) {
    settings = await ShopSettings.findOne({ shopkeeper: adminUser._id }).lean();
  }

  return (
    <footer className="bg-muted/50 border-t md:pb-0 pb-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              {settings?.logo ? (
                <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-zinc-100">
                  <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <Store className="h-6 w-6 text-primary" />
              )}
              <span>{settings?.shopName || "ShopManager"}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings?.aboutText || "Your one-stop destination for premium goods. Quality and satisfaction guaranteed."}
            </p>
            <div className="flex gap-4">
              <a href={settings?.socialLinks?.facebook || "https://facebook.com"} target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5 cursor-pointer hover:text-primary transition-colors text-zinc-500 hover:text-blue-600" />
              </a>
              <a href={settings?.socialLinks?.instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 cursor-pointer hover:text-primary transition-colors text-zinc-500 hover:text-pink-600" />
              </a>
              <a href={settings?.socialLinks?.twitter || "https://twitter.com"} target="_blank" rel="noopener noreferrer">
                <Twitter className="h-5 w-5 cursor-pointer hover:text-primary transition-colors text-zinc-500 hover:text-sky-500" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary">Shop All</Link></li>
              <li><Link href="/categories" className="hover:text-primary">Categories</Link></li>
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-zinc-800 dark:text-zinc-200">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/account/orders" className="hover:text-primary">Order Tracking</Link></li>
              <li><Link href="/shipping" className="hover:text-primary">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-primary">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQs</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Contact Info</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>{settings?.contactInfo?.address || "123 Commerce St, Digital City"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>{settings?.contactInfo?.phone || "+1 (555) 000-1234"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>{settings?.contactInfo?.email || "support@shopmanager.com"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {settings?.shopName || "ShopManager"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
