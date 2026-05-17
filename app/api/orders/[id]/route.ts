import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    
    // Populate products in items to get images
    const order = await Order.findById(params.id)
      .populate({
        path: "items.product",
        select: "name images price slug"
      })
      .populate("user", "name email")
      .populate("shopkeeper", "name email");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization: Ensure the user owns the order OR is the shopkeeper for this order OR is an admin
    const isOwner = order.user._id.toString() === session.user.id;
    const isShopkeeper = order.shopkeeper.toString() === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isOwner && !isShopkeeper && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Fetch Order Error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
