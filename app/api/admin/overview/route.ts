import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Category from "@/models/Category";
import ShopSettings from "@/models/ShopSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalRevenue,
      monthlyRevenue,
      previousMonthlyRevenue,
      totalOrders,
      monthlyOrders,
      previousMonthlyOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalUsers,
      totalShopkeepers,
      totalCustomers,
      totalCategories,
      totalShops,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: previousMonthStart, $lt: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      Order.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }),
      User.countDocuments(),
      User.countDocuments({ role: "shopkeeper" }),
      User.countDocuments({ role: "customer" }),
      Category.countDocuments(),
      ShopSettings.countDocuments(),
      Order.find()
        .populate("user", "name email")
        .populate("shopkeeper", "name email")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            sold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const currentRevenue = monthlyRevenue[0]?.total || 0;
    const lastRevenue = previousMonthlyRevenue[0]?.total || 0;
    const revenueChange = lastRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : null;
    const orderChange = previousMonthlyOrders
      ? ((monthlyOrders - previousMonthlyOrders) / previousMonthlyOrders) * 100
      : null;

    return NextResponse.json({
      stats: {
        totalRevenue: revenue,
        monthlyRevenue: currentRevenue,
        revenueChange,
        totalOrders,
        monthlyOrders,
        orderChange,
        totalProducts,
        activeProducts,
        lowStockProducts,
        totalUsers,
        totalShopkeepers,
        totalCustomers,
        totalCategories,
        totalShops,
        averageOrderValue: totalOrders ? revenue / totalOrders : 0,
      },
      recentOrders: recentOrders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
        user: order.user
          ? { ...order.user, _id: order.user._id.toString() }
          : null,
        shopkeeper: order.shopkeeper
          ? { ...order.shopkeeper, _id: order.shopkeeper._id.toString() }
          : null,
      })),
      topProducts: topProducts.map((product) => ({
        ...product,
        _id: product._id instanceof mongoose.Types.ObjectId ? product._id.toString() : product._id,
      })),
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    return NextResponse.json({ error: "Failed to load admin overview" }, { status: 500 });
  }
}
