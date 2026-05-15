import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "shopkeeper" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "daily"; // daily, weekly, monthly

    await dbConnect();

    let startDate = new Date();
    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "monthly") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const match: any = {
      createdAt: { $gte: startDate },
      status: { $ne: "cancelled" }
    };

    if (session.user.role === "shopkeeper") {
      match.shopkeeper = session.user.id;
    }

    const salesReport = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: period === "daily" ? "%Y-%m-%d %H:00" : "%Y-%m-%d", 
              date: "$createdAt" 
            }
          },
          totalSales: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    return NextResponse.json(salesReport);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sales report" }, { status: 500 });
  }
}
