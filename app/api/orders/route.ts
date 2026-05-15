import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendLowStockAlertEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await dbConnect();

    const orderNumber = `ORD-${Date.now()}`;
    
    // Create the order
    const order = await Order.create({
      ...data,
      user: session.user.id,
      orderNumber,
    });

    // Update stock and check for low stock alerts
    for (const item of data.items) {
      const product = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      ).populate('shopkeeper');

      if (product && product.stock <= product.lowStockThreshold) {
        const shopkeeper = product.shopkeeper;
        if (shopkeeper && shopkeeper.email) {
          await sendLowStockAlertEmail(shopkeeper.email, product.name, product.stock);
        }
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
