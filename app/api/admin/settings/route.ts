import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    
    // Find the primary admin user to get their settings document
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    let settings = await ShopSettings.findOne({ shopkeeper: adminUser._id });

    if (!settings) {
      // Create default settings if none exist
      settings = await ShopSettings.create({
        shopkeeper: adminUser._id,
        shopName: "Shop Manager App",
        logo: "",
        bannerImages: [],
        contactInfo: { email: adminUser.email || "", phone: "", address: "" },
        homepage: {
          heroTitle: "Premium Multi-Shop Ecosystem",
          heroDescription: "Experience seamless shopping from verified curated local stores.",
          heroBtnText: "Shop Now",
          heroBtnLink: "/products",
          promoTitle: "Exclusive Launch Offer",
          promoDescription: "Get the best deals directly from our partner shops.",
          promoDiscount: "Up to 50% Off",
          promoBtnText: "View Deals",
          promoBtnLink: "/deals",
          promoBannerImage: "",
          features: [
            { title: "Free Shipping", icon: "Truck", description: "On all orders over BDT 1000" },
            { title: "24/7 Support", icon: "Clock", description: "Dedicated customer service" },
            { title: "Secure Payment", icon: "Shield", description: "100% secure payment gateway" }
          ]
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET Admin Settings Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await dbConnect();

    // Ensure it associates with this admin user
    const settings = await ShopSettings.findOneAndUpdate(
      { shopkeeper: session.user.id },
      { $set: { ...data, shopkeeper: session.user.id } },
      { new: true, upsert: true }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("PUT Admin Settings Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
