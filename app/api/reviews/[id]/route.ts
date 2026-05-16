import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "shopkeeper")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isApproved } = await req.json();
    await dbConnect();

    const review = await Review.findById(params.id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // Authorization check for shopkeepers: must own the product
    if (session.user.role === "shopkeeper") {
      const product = await Product.findById(review.product);
      if (!product || product.shopkeeper.toString() !== session.user.id) {
        return NextResponse.json({ error: "Forbidden: You don't own this product" }, { status: 403 });
      }
    }

    const wasApproved = review.isApproved;
    review.isApproved = isApproved;
    await review.save();

    // If approval status changed, update product stats
    if (!wasApproved && isApproved) {
      const product = await Product.findById(review.product);
      if (product) {
        const totalRating = (product.averageRating * product.reviewCount) + review.rating;
        product.reviewCount += 1;
        product.averageRating = totalRating / product.reviewCount;
        await product.save();
      }
    } else if (wasApproved && !isApproved) {
      const product = await Product.findById(review.product);
      if (product && product.reviewCount > 0) {
        const totalRating = (product.averageRating * product.reviewCount) - review.rating;
        product.reviewCount -= 1;
        product.averageRating = product.reviewCount > 0 ? totalRating / product.reviewCount : 0;
        await product.save();
      }
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const review = await Review.findById(params.id);
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    // Check if user is review author, admin, or product shopkeeper
    let isAuthorized = session.user.role === "admin" || session.user.id === review.user.toString();
    
    if (!isAuthorized && session.user.role === "shopkeeper") {
      const product = await Product.findById(review.product);
      if (product && product.shopkeeper.toString() === session.user.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If it was approved, decrement product stats
    if (review.isApproved) {
      const product = await Product.findById(review.product);
      if (product && product.reviewCount > 0) {
        const totalRating = (product.averageRating * product.reviewCount) - review.rating;
        product.reviewCount -= 1;
        product.averageRating = product.reviewCount > 0 ? totalRating / product.reviewCount : 0;
        await product.save();
      }
    }

    await Review.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
