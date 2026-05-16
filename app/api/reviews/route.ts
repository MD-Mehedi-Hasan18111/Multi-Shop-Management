import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, rating, comment } = await req.json();
    await dbConnect();

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: session.user.id, product: productId });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
    }

    const review = await Review.create({
      user: session.user.id,
      product: productId,
      rating,
      comment,
      isApproved: false, // Default to false for moderation
    });

    // Update product review stats (only count approved reviews in real scenarios, 
    // but for now we'll just track all or wait for moderation)
    // For simplicity, let's just create it and wait for moderation to update product average.

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 });

    await dbConnect();
    const reviews = await Review.find({ product: productId, isApproved: true })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
