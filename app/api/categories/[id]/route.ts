import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Category from "@/models/Category";
import Product from "@/models/Product";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/ /g, "-").replace(/[^\w-]+/g, "");
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    await dbConnect();

    const update: Record<string, any> = {};
    if (data.name) {
      update.name = data.name;
      update.slug = data.slug ? slugify(data.slug) : slugify(data.name);
    }
    if (typeof data.image === "string") update.image = data.image;
    if (typeof data.order === "number") update.order = data.order;
    if (data.parent !== undefined) update.parent = data.parent || null;

    const category = await Category.findByIdAndUpdate(params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Update Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const productCount = await Product.countDocuments({ category: params.id });
    if (productCount > 0) {
      return NextResponse.json(
        { error: "Move or delete products in this category first" },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
