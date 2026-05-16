import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/site/Navbar";
import BottomNav from "@/components/site/BottomNav";
import { Footer } from "@/components/site/Footer";
import { ServiceWorkerCleanup } from "@/components/ServiceWorkerCleanup";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="/dev-sw-cleanup.js" strategy="beforeInteractive" />
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
