import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    let settings = await ShopSettings.findOne({ shopkeeper: session.user.id });
    
    if (!settings) {
      // Return default settings if none exist yet
      return NextResponse.json({
        shopName: "",
        logo: "",
        aboutText: "",
        contactInfo: { email: session.user.email, phone: "", address: "" },
        socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "" },
        bannerImages: []
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Fetch Shop Settings Error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    let slug = data.slug;
    if (!slug && data.shopName) {
      slug = data.shopName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Filter data to only include valid fields to avoid "strict mode" errors
    const updateData = {
      shopName: data.shopName,
      slug: slug,
      logo: data.logo,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      bannerImages: data.bannerImages,
      contactInfo: data.contactInfo,
      socialLinks: data.socialLinks,
      aboutText: data.aboutText,
      shopkeeper: session.user.id
    };

    const settings = await ShopSettings.findOneAndUpdate(
      { shopkeeper: session.user.id },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Save Shop Settings Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
