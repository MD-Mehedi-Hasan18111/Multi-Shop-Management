import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const url = new URL(req.url);
    const shopkeeperId = url.searchParams.get("shopkeeper");
    
    // If shopkeeper parameter is passed, filter by it.
    // Ensure the requester is either the shopkeeper or an admin
    let query: any = {};
    if (shopkeeperId) {
      if (session.user.role !== 'admin' && session.user.id !== shopkeeperId) {
         return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      query.shopkeeper = shopkeeperId;
    } else if (session.user.role === 'shopkeeper') {
      // By default, a shopkeeper gets their own products
      query.shopkeeper = session.user.id;
    }

    // Include category details if needed
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // ensure slug is unique
    let slug = data.slug || data.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    const newProduct = new Product({
      ...data,
      slug,
      shopkeeper: session.user.id,
    });

    await newProduct.save();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
