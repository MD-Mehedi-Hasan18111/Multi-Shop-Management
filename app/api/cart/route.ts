import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ items: [] });

    await dbConnect();
    const cart = await Cart.findOne({ user: session.user.id });
    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items, total } = await req.json();
    await dbConnect();

    const cart = await Cart.findOneAndUpdate(
      { user: session.user.id },
      { items, total },
      { upsert: true, new: true }
    );

    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}
