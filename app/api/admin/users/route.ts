import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";

export const dynamic = "force-dynamic";

const roles = ["customer", "shopkeeper", "admin"];

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const query: Record<string, any> = {};
    if (role && roles.includes(role)) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, role, isActive } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "A valid user is required" }, { status: 400 });
    }

    if (role !== undefined && !roles.includes(role)) {
      return NextResponse.json({ error: "A valid role is required" }, { status: 400 });
    }

    if (userId === session.user.id && role !== undefined && role !== "admin") {
      return NextResponse.json({ error: "You cannot remove your own admin role" }, { status: 400 });
    }

    if (userId === session.user.id && isActive === false) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    await dbConnect();
    const update: Record<string, any> = {};
    if (role !== undefined) update.role = role;
    if (typeof isActive === "boolean") update.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      update,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update User Role Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete User record
    await User.findByIdAndDelete(userId);

    // Clean up relational details dynamically
    const SellerRequest = (await import("@/models/SellerRequest")).default;
    const ShopSettings = (await import("@/models/ShopSettings")).default;
    await SellerRequest.deleteMany({ user: userId });
    await ShopSettings.deleteMany({ shopkeeper: userId });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
