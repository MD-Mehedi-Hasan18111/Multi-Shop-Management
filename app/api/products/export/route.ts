import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const products = await Product.find({ shopkeeper: session.user.id });

    // Convert to CSV string
    const headers = ["name", "sku", "price", "stock", "description", "category", "barcode"];
    const csvRows = [
      headers.join(","),
      ...products.map(p => [
        `"${p.name}"`,
        `"${p.sku}"`,
        p.price,
        p.stock,
        `"${p.description.replace(/"/g, '""')}"`,
        p.category,
        `"${p.barcode || ''}"`
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="products_export_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}
