import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const products = await Product.find({ shopkeeper: session.user.id }).populate("category", "name").lean();

    const headers = ["name", "price", "stock", "sku", "description", "category", "comparePrice", "barcode"];
    const csvRows = products.map((p: any) => {
      return headers.map(h => {
        let val = p[h] || "";
        if (h === "category") val = p.category?.name || "";
        // Escape quotes and wrap in quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=products-export-${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type");
    let products: any[] = [];

    if (contentType?.includes("text/csv") || contentType?.includes("application/octet-stream")) {
      const csvText = await req.text();
      const lines = csvText.split(/\r?\n/);
      if (lines.length < 2) return NextResponse.json({ error: "Invalid CSV" }, { status: 400 });

      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
      products = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const product: any = {};
        headers.forEach((h, i) => {
          let val = values[i]?.trim().replace(/^"|"$/g, '').replace(/""/g, '"') || "";
          if (h === "price" || h === "stock" || h === "comparePrice") {
            product[h] = parseFloat(val) || 0;
          } else {
            product[h] = val;
          }
        });
        return product;
      });
    } else {
      const data = await req.json();
      products = data.products || [];
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products found in data" }, { status: 400 });
    }

    await dbConnect();

    // Resolve categories (find or create)
    const categoryNames = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const categoryMap = new Map();

    for (const name of categoryNames) {
      let cat = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
      if (!cat) {
        cat = await Category.create({
          name,
          slug: String(name).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
        });
      }
      categoryMap.set(String(name).toLowerCase(), cat._id);
    }

    const preparedProducts = products.map(p => ({
      ...p,
      shopkeeper: session.user.id,
      category: categoryMap.get(String(p.category).toLowerCase()),
      slug: p.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(7),
      _id: undefined
    }));

    await Product.insertMany(preparedProducts);

    return NextResponse.json({ message: `Successfully imported ${products.length} products` });
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
  }
}
