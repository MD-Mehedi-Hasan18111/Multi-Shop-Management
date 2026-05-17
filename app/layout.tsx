import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/site/Navbar";
import BottomNav from "@/components/site/BottomNav";
import { Footer } from "@/components/site/Footer";
import { ServiceWorkerCleanup } from "@/components/ServiceWorkerCleanup";
import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";
import User from "@/models/User";

function hexToHsl(hex: string) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  if (hex.length !== 6) return null;
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Shop Manager",
    template: "%s | Shop Manager",
  },
  description: "A modern multi-tenant shop management system",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shop Manager",
  },
  openGraph: {
    type: "website",
    siteName: "Shop Manager",
    title: "Shop Manager",
    description: "A modern multi-tenant shop management system",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Manager",
    description: "A modern multi-tenant shop management system",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await dbConnect();
  const adminUser = await User.findOne({ role: "admin" });
  let appSettings = null;
  if (adminUser) {
    appSettings = await ShopSettings.findOne({ shopkeeper: adminUser._id }).lean();
  }

  let primaryHsl = "";
  let secondaryHsl = "";
  if (appSettings?.primaryColor) {
    primaryHsl = hexToHsl(appSettings.primaryColor) || "";
  }
  if (appSettings?.secondaryColor) {
    secondaryHsl = hexToHsl(appSettings.secondaryColor) || "";
  }

  return (
    <html lang="en">
      <head>
        <Script src="/dev-sw-cleanup.js" strategy="beforeInteractive" />
        {primaryHsl && (
          <style dangerouslySetInnerHTML={{__html: `
            :root {
              --primary: ${primaryHsl} !important;
            }
          `}} />
        )}
        {secondaryHsl && (
          <style dangerouslySetInnerHTML={{__html: `
            :root {
              --secondary: ${secondaryHsl} !important;
            }
          `}} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ServiceWorkerCleanup />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pb-20 md:pb-0">{children}</main>
            <Footer />
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
