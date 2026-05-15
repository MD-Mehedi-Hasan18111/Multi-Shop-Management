import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product"; // Added for population
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ items: [] });

    await dbConnect();
    const cart = await Cart.findOne({ user: session.user.id }).populate({
      path: 'items.product',
      select: 'name price images sku'
    });

    if (!cart) return NextResponse.json({ items: [] });

    // Transform DB format to Redux format
    const transformedItems = cart.items.map((item: any) => ({
      id: item.product._id.toString(),
      name: item.product.name,
      price: item.product.price,
      image: item.product.images?.[0] || "",
      quantity: item.quantity,
      sku: item.product.sku
    }));

    return NextResponse.json({ items: transformedItems, total: cart.total });
  } catch (error) {
    console.error("Fetch cart error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items, total } = await req.json();
    await dbConnect();

    // Transform Redux format back to DB format (only product ID and quantity)
    const dbItems = items.map((item: any) => ({
      product: item.id,
      quantity: item.quantity
    }));

    const cart = await Cart.findOneAndUpdate(
      { user: session.user.id },
      { items: dbItems, total },
      { upsert: true, new: true }
    );

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Sync cart error:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
