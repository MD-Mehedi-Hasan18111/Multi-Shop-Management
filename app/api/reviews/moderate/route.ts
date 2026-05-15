import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "shopkeeper")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    let query = {};
    if (session.user.role === "shopkeeper") {
      // Find products belonging to this shopkeeper
      const products = await Product.find({ shopkeeper: session.user.id }).select("_id");
      const productIds = products.map(p => p._id);
      query = { product: { $in: productIds } };
    }

    const reviews = await Review.find(query)
      .populate("user", "name")
      .populate("product", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
