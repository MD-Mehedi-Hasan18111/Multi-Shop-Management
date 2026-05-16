import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Find products where stock is less than or equal to lowStockThreshold
    const lowStockProducts = await Product.find({
      shopkeeper: session.user.id,
      isActive: true,
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    }).select("name stock lowStockThreshold price").limit(10);

    return NextResponse.json(lowStockProducts);
  } catch (error) {
    console.error("Low Stock Report Error:", error);
    return NextResponse.json({ error: "Failed to fetch low stock products" }, { status: 500 });
  }
}
