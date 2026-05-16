import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendLowStockAlertEmail } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    await dbConnect();

    // 1. Fetch all products to get their shopkeepers and current prices/stock
    const productIds = data.items.map((item: any) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).populate("shopkeeper");
    
    // Create a map for quick lookup
    const productMap = new Map();
    products.forEach(p => productMap.set(p._id.toString(), p));

    // 2. Group items by shopkeeper
    const itemsByShopkeeper: Record<string, any[]> = {};
    data.items.forEach((item: any) => {
      const product = productMap.get(item.product);
      if (!product) throw new Error(`Product ${item.product} not found`);
      
      const shopkeeperId = product.shopkeeper._id.toString();
      if (!itemsByShopkeeper[shopkeeperId]) {
        itemsByShopkeeper[shopkeeperId] = [];
      }
      itemsByShopkeeper[shopkeeperId].push({
        ...item,
        shopkeeper: shopkeeperId
      });
    });

    const orders = [];

    // 3. Create an order for each shopkeeper
    for (const [shopkeeperId, items] of Object.entries(itemsByShopkeeper)) {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const shopkeeperTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      // For simplicity, we'll apply the same shipping info to all. 
      // In a real app, you might split tax/shipping proportionally.
      
      const newOrder = await Order.create({
        orderNumber,
        user: session.user.id,
        shopkeeper: shopkeeperId,
        items: items.map(item => ({
          product: item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: shopkeeperTotal, // Should include tax/shipping if applicable
        paymentMethod: data.paymentMethod || "cod",
        shippingAddress: {
          name: `${data.shippingAddress.firstName} ${data.shippingAddress.lastName}`,
          street: data.shippingAddress.address,
          city: data.shippingAddress.city,
          zipCode: data.shippingAddress.zipCode,
          phone: data.shippingAddress.phone,
          country: data.shippingAddress.country || "Bangladesh"
        },
        status: 'pending'
      });

      orders.push(newOrder);

      // 4. Update stock and check for low stock alerts
      for (const item of items) {
        const product = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true }
        ).populate('shopkeeper');

        if (product && product.stock <= product.lowStockThreshold) {
          const shopkeeper = product.shopkeeper;
          if (shopkeeper && shopkeeper.email) {
            await sendLowStockAlertEmail(shopkeeper.email, product.name, product.stock);
          }
        }
      }
    }

    // Return the first order or a summary (frontend expects one order usually)
    return NextResponse.json(orders[0], { status: 201 });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    
    let query = {};
    if (session.user.role === "admin") {
      query = {};
    } else if (session.user.role === "shopkeeper") {
      query = { shopkeeper: session.user.id };
    } else {
      query = { user: session.user.id };
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
