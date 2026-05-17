import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ShopSettings from "@/models/ShopSettings";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_vercel_build", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { items, shippingAddress } = await req.json();
    await dbConnect();

    const productIds = items.map((item: any) => item.id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).populate("shopkeeper");
    const shopkeeperIds = Array.from(
      new Set(products.map((product: any) => product.shopkeeper?._id?.toString()).filter(Boolean))
    );
    const blockedShop = await ShopSettings.findOne({
      shopkeeper: { $in: shopkeeperIds },
      isBlocked: true,
    });

    if (blockedShop) {
      return NextResponse.json(
        { error: `${blockedShop.shopName || "A shop"} is blocked from selling` },
        { status: 403 }
      );
    }

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "bdt",
        product_data: {
          name: item.name,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/account/orders?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart?canceled=true`,
      customer_email: session.user.email!,
      metadata: {
        userId: session.user.id,
        shippingAddress: JSON.stringify(shippingAddress),
        items: JSON.stringify(items.map((i: any) => ({ id: i.id, quantity: i.quantity }))),
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
