import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productsData = await req.json(); // Expecting an array of product objects
    if (!Array.isArray(productsData)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array." }, { status: 400 });
    }

    await dbConnect();

    const preparedProducts = productsData.map(p => ({
      ...p,
      shopkeeper: session.user.id,
      slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now()
    }));

    const result = await Product.insertMany(preparedProducts);

    return NextResponse.json({ 
      message: `${result.length} products imported successfully`,
      count: result.length 
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import products. Check for duplicate SKUs or invalid data." }, { status: 500 });
  }
}
