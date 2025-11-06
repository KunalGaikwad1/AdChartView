import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";

export async function POST(req: Request) {
  try {
    await connectDB(); // ✅ Ensure DB connected

    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ 5 Min Expiry Set
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Remove old OTP if exists
    await Otp.deleteMany({ phone });

    // ✅ Save new OTP
    await Otp.create({ phone, code: otp, expiresAt });

    // ✅ Send SMS via Fast2SMS
    await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "v3",
        sender_id: "TXTIND",
        message: `Your AdChartView verification code is ${otp}. It expires in 5 minutes.`,
        language: "english",
        numbers: phone,
      }),
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });

  } catch (err: any) {
    console.error("send-otp error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
