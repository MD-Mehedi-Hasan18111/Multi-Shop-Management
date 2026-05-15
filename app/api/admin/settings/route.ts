import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShopSettings from "@/models/ShopSettings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    let settings = await ShopSettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await ShopSettings.create({
        shopName: "My Shop",
        contactInfo: { email: "", phone: "", address: "" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
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

    const settings = await ShopSettings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
