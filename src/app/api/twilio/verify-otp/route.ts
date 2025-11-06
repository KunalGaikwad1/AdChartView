import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { phone, code } = await req.json();
    if (!phone || !code) {
      return NextResponse.json({ success: false, error: "Phone & OTP required" }, { status: 400 });
    }

    const otpEntry = await Otp.findOne({ phone });

    if (!otpEntry) {
      return NextResponse.json({ success: false, error: "OTP expired or not sent" }, { status: 400 });
    }

    if (otpEntry.expiresAt < new Date()) {
      await Otp.deleteOne({ phone });
      return NextResponse.json({ success: false, error: "OTP expired" }, { status: 400 });
    }

    if (otpEntry.code !== code) {
      return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    }

    // ✅ Verified successfully — Remove OTP
    await Otp.deleteOne({ phone });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("verify-otp error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
