import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json({ error: "Email and OTP code are required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ message: "Email is already verified", verified: true });
    }

    if (user.otpCode !== otpCode) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (user.otpExpiry && new Date(user.otpExpiry) < new Date()) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
    }

    // Mark email as verified and clear OTP fields
    user.isEmailVerified = true;
    user.otpCode = "";
    user.otpExpiry = null;
    await user.save();

    return NextResponse.json({ message: "Email verified successfully", verified: true });
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json({ error: error.message || "Failed to verify code" }, { status: 500 });
  }
}
