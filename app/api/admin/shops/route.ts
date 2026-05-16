import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import ShopSettings from "@/models/ShopSettings";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const query: Record<string, any> = {};
    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { "contactInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    const shops = await ShopSettings.find(query)
      .populate("shopkeeper", "name email role")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const shopkeeperIds = shops
      .map((shop: any) => shop.shopkeeper?._id)
      .filter(Boolean);

    const [productStats, orderStats] = await Promise.all([
      Product.aggregate([
        { $match: { shopkeeper: { $in: shopkeeperIds } } },
        {
          $group: {
            _id: "$shopkeeper",
            productCount: { $sum: 1 },
            activeProductCount: { $sum: { $cond: ["$isActive", 1, 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $match: { shopkeeper: { $in: shopkeeperIds } } },
        {
          $group: {
            _id: "$shopkeeper",
            orderCount: { $sum: 1 },
            revenue: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 0, "$total"] },
            },
          },
        },
      ]),
    ]);

    const productsByShopkeeper = new Map(productStats.map((item) => [item._id.toString(), item]));
    const ordersByShopkeeper = new Map(orderStats.map((item) => [item._id.toString(), item]));

    return NextResponse.json(
      shops.map((shop: any) => {
        const shopkeeperId = shop.shopkeeper?._id?.toString();
        return {
          ...shop,
          _id: shop._id.toString(),
          shopkeeper: shop.shopkeeper
            ? { ...shop.shopkeeper, _id: shop.shopkeeper._id.toString() }
            : null,
          productCount: shopkeeperId ? productsByShopkeeper.get(shopkeeperId)?.productCount || 0 : 0,
          activeProductCount: shopkeeperId
            ? productsByShopkeeper.get(shopkeeperId)?.activeProductCount || 0
            : 0,
          orderCount: shopkeeperId ? ordersByShopkeeper.get(shopkeeperId)?.orderCount || 0 : 0,
          revenue: shopkeeperId ? ordersByShopkeeper.get(shopkeeperId)?.revenue || 0 : 0,
        };
      })
    );
  } catch (error) {
    console.error("Admin Shops Error:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
