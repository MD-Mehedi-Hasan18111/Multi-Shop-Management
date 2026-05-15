import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { avatar } = await req.json();
    if (!avatar) {
      return NextResponse.json({ error: "Avatar URL is required" }, { status: 400 });
    }

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { avatar } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Profile updated successfully",
      avatar: updatedUser.avatar 
    });
  } catch (error: any) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
