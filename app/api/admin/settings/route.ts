import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AppSettings from "@/models/AppSettings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    
    let settings = await AppSettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await AppSettings.create({});
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

    // Update the single global AppSettings record
    let settings = await AppSettings.findOne();
    if (!settings) {
      settings = await AppSettings.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("PUT Admin Settings Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
