import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const shop = await ShopSettings.findOne({ slug });
      if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });
      return NextResponse.json(shop);
    }

    const shops = await ShopSettings.find({}).select("shopName logo slug aboutText");
    return NextResponse.json(shops);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
