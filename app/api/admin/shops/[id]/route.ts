import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import ShopSettings from "@/models/ShopSettings";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const shop = await ShopSettings.findById(params.id)
      .populate("shopkeeper", "name email role isActive")
      .lean();

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const shopkeeperId = (shop as any).shopkeeper?._id;
    const [products, orders, revenue] = await Promise.all([
      Product.find({ shopkeeper: shopkeeperId })
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Order.find({ shopkeeper: shopkeeperId })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Order.aggregate([
        { $match: { shopkeeper: shopkeeperId, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({
      shop,
      products,
      orders,
      stats: {
        productCount: products.length,
        orderCount: revenue[0]?.orders || 0,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Admin Shop Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 });
  }
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

    const { isBlocked } = await req.json();
    if (typeof isBlocked !== "boolean") {
      return NextResponse.json({ error: "A valid block status is required" }, { status: 400 });
    }

    await dbConnect();
    const shop = await ShopSettings.findByIdAndUpdate(
      params.id,
      { isBlocked },
      { new: true, runValidators: true }
    ).populate("shopkeeper", "name email role isActive");

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Update Admin Shop Detail Error:", error);
    return NextResponse.json({ error: "Failed to update shop" }, { status: 500 });
  }
}
