import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Generate new OTP and set 24h expiry
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.otpCode = otpCode;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send the OTP via Email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "New Verification OTP - Shop Manager",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 16px;">
            <h2 style="color: #2563eb; text-align: center; font-weight: 800; margin-bottom: 20px;">New OTP Requested</h2>
            <p style="font-size: 15px; color: #3f3f46; line-height: 1.5;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 15px; color: #3f3f46; line-height: 1.5;">You requested a new verification code. Please use the following 6-digit One-Time Password (OTP) to verify your email address:</p>
            
            <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #09090b; font-family: monospace;">${otpCode}</span>
            </div>
            
            <p style="font-size: 13px; color: #71717a; line-height: 1.5;">This verification code is valid for <strong>24 hours</strong>. If this code expires, you can request a new OTP again.</p>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 25px 0;" />
            <p style="font-size: 11px; color: #a1a1aa; text-align: center; line-height: 1.5;">If you did not request a new OTP code, please disregard this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ message: "A new OTP code has been sent to your email" });
  } catch (error: any) {
    console.error("Resend OTP Error:", error);
    return NextResponse.json({ error: error.message || "Failed to resend code" }, { status: 500 });
  }
}
