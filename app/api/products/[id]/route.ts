import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const product = await Product.findById(params.id).populate("category", "name slug");
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Fetch Product Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "shopkeeper" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Authorization: only the owner or an admin can update
    if (session.user.role !== "admin" && product.shopkeeper.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You don't own this product" }, { status: 403 });
    }

    const data = await req.json();
    
    // Update fields
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "shopkeeper" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const product = await Product.findById(params.id);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Authorization: only the owner or an admin can delete
    if (session.user.role !== "admin" && product.shopkeeper.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You don't own this product" }, { status: 403 });
    }

    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
