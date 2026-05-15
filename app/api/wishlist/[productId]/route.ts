import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = params;
    await dbConnect();

    const wishlist = await Wishlist.findOne({ user: session.user.id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id: any) => id.toString() !== productId
      );
      await wishlist.save();
    }

    return NextResponse.json({ message: "Product removed from wishlist" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
