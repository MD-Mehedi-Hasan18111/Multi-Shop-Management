import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SellerRequest from "@/models/SellerRequest";
import User from "@/models/User";
import ShopSettings from "@/models/ShopSettings";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendSellerRequestStatusEmail } from "@/lib/notifications";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const requests = await SellerRequest.find()
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("GET Admin Seller Requests Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await req.json();

    if (!requestId || !["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await dbConnect();

    const request = await SellerRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ error: "Request is already processed" }, { status: 400 });
    }

    const user = await User.findById(request.user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "approved") {
      // 1. Update Request
      request.status = "approved";
      await request.save();

      // 2. Upgrade User Role
      user.role = "shopkeeper";
      await user.save();

      // 3. Create Default Shop Settings for New Seller
      const existingSettings = await ShopSettings.findOne({ shopkeeper: user._id });
      if (!existingSettings) {
        await ShopSettings.create({
          shopkeeper: user._id,
          shopName: request.shopName,
          logo: "",
          bannerImages: [],
          contactInfo: {
            email: user.email || "",
            phone: "",
            address: "",
          },
          homepage: {
            heroTitle: `Welcome to ${request.shopName}`,
            heroDescription: `Discover our products in the ${request.niche} category.`,
            heroBtnText: "Browse Products",
            heroBtnLink: "/products",
          },
        });
      }

      // 4. Create In-App Notification for User
      await Notification.create({
        user: user._id,
        title: "Seller Application Approved",
        message: `Congratulations! Your seller application for "${request.shopName}" has been approved!`,
        type: "system",
        link: "/shopkeeper/dashboard",
      });

      // 5. Send Congrats Email
      await sendSellerRequestStatusEmail(
        user.email || "",
        user.name || "Customer",
        request.shopName,
        "approved"
      );
    } else {
      // Reject Request
      request.status = "rejected";
      await request.save();

      // Create In-App Notification for User
      await Notification.create({
        user: user._id,
        title: "Seller Application Declined",
        message: `We regret to inform you that your application for "${request.shopName}" could not be approved at this time.`,
        type: "system",
        link: "/account",
      });

      // Send Rejection Email
      await sendSellerRequestStatusEmail(
        user.email || "",
        user.name || "Customer",
        request.shopName,
        "rejected"
      );
    }

    return NextResponse.json({
      message: `Request successfully ${action}`,
      request,
    });
  } catch (error: any) {
    console.error("PUT Admin Seller Requests Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
