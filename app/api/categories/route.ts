import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Fetch Categories Error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "shopkeeper" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    let slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    let existingCategory = await Category.findOne({ slug });
    
    if (existingCategory) {
      slug = `${slug}-${Date.now()}`;
    }

    const newCategory = new Category({
      name,
      slug,
    });

    await newCategory.save();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error("Create Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
