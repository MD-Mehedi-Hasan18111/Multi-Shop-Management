import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SellerRequest from "@/models/SellerRequest";
import User from "@/models/User";
import Notification from "@/models/Notification";
import ShopSettings from "@/models/ShopSettings";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendSellerRequestEmail } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const dbUser = await User.findById(session.user.id);
    const request = await SellerRequest.findOne({ user: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({
      role: dbUser?.role || session.user.role,
      request: request || null,
    });
  } catch (error: any) {
    console.error("GET Become Seller Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch status" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopName, niche, nidNumber, nidImage, productDetails } = await req.json();

    if (!shopName || !niche || !nidNumber || !nidImage || !productDetails) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await dbConnect();

    // Check if there is already a pending request
    const existing = await SellerRequest.findOne({
      user: session.user.id,
      status: "pending",
    });

    if (existing) {
      return NextResponse.json({ error: "You already have a pending seller application" }, { status: 400 });
    }

    // Save request
    const newRequest = await SellerRequest.create({
      user: session.user.id,
      shopName,
      niche,
      nidNumber,
      nidImage,
      productDetails,
    });

    // Notify Administrator in App
    const adminUser = await User.findOne({ role: "admin" });
    const adminEmail = adminUser?.email || "mdmehedihasan18111@gmail.com";

    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        title: "New Seller Application",
        message: `${session.user.name || "A customer"} has applied to become a Seller for "${shopName}".`,
        type: "system",
        link: "/admin/seller-requests",
      });
    }

    // Send email to admin
    await sendSellerRequestEmail(
      adminEmail,
      session.user.name || "Customer",
      session.user.email || "",
      shopName,
      niche,
      nidNumber,
      nidImage,
      productDetails
    );

    return NextResponse.json({
      message: "Application submitted successfully",
      request: newRequest,
    });
  } catch (error: any) {
    console.error("POST Become Seller Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit request" }, { status: 500 });
  }
}
