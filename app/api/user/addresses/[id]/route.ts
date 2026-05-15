import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Address from "@/models/Address";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const data = await req.json();

    await dbConnect();

    // Verify ownership
    const existingAddress = await Address.findOne({ _id: id, user: session.user.id });
    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Handle isDefault logic
    if (data.isDefault) {
      await Address.updateMany({ user: session.user.id, _id: { $ne: id } }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedAddress);
  } catch (error: any) {
    console.error("Update Address Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await dbConnect();

    const deletedAddress = await Address.findOneAndDelete({ _id: id, user: session.user.id });

    if (!deletedAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // If we deleted the default address, make the most recently created address the new default
    if (deletedAddress.isDefault) {
      const remainingAddress = await Address.findOne({ user: session.user.id }).sort({ createdAt: -1 });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error: any) {
    console.error("Delete Address Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 });
  }
}
