import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendSMS, sendStatusUpdateEmail } from "@/lib/notifications";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "shopkeeper")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    await dbConnect();

    const existingOrder = await Order.findById(params.id);

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      session.user.role !== "admin" &&
      existingOrder.shopkeeper.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).populate("user");

    // Trigger External Notifications
    await sendStatusUpdateEmail(order.user.email, order.orderNumber, status);
    if (order.shippingAddress?.phone) {
      await sendSMS(order.shippingAddress.phone, `Your order ${order.orderNumber} status is now: ${status}`);
    }

    // Create Internal Notification
    await Notification.create({
      user: order.user._id,
      title: "Order Update",
      message: `Your order ${order.orderNumber} status has been updated to ${status}.`,
      type: "order_update",
      link: `/orders/${order._id}`
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
