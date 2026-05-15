import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const addresses = await Address.find({ user: session.user.id }).sort({ isDefault: -1, createdAt: -1 });
    
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Fetch Addresses Error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();

    // If this is set as default, unset other default addresses
    if (data.isDefault) {
      await Address.updateMany({ user: session.user.id }, { isDefault: false });
    } else {
      // If no addresses exist, make this the default
      const count = await Address.countDocuments({ user: session.user.id });
      if (count === 0) {
        data.isDefault = true;
      }
    }

    const newAddress = new Address({
      ...data,
      user: session.user.id,
    });

    await newAddress.save();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    console.error("Create Address Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create address" }, { status: 500 });
  }
}
