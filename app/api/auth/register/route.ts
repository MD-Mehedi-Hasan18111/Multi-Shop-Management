import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create user
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer", // Default role
      isEmailVerified: false,
      otpCode,
      otpExpiry,
    });

    // 5. Send Verification OTP Email
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
        subject: "Verify Your Email - One-Time Password (OTP)",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 16px;">
            <h2 style="color: #2563eb; text-align: center; font-weight: 800; margin-bottom: 20px;">Email Verification</h2>
            <p style="font-size: 15px; color: #3f3f46; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #3f3f46; line-height: 1.5;">Thank you for signing up with Shop Manager. Please verify your email address to enable access to your account by entering the following 6-digit One-Time Password (OTP):</p>
            
            <div style="background-color: #f4f4f5; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
              <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #09090b; font-family: monospace;">${otpCode}</span>
            </div>
            
            <p style="font-size: 13px; color: #71717a; line-height: 1.5;">This verification code is valid for <strong>24 hours</strong>. If the code expires, you can request a new OTP on the verification screen.</p>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 25px 0;" />
            <p style="font-size: 11px; color: #a1a1aa; text-align: center; line-height: 1.5;">If you did not request this sign-up, please ignore this email or contact support if you have concerns.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return NextResponse.json(
      { message: "Verification OTP sent successfully", userId: user._id, email: user.email },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
