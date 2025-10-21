import { NextResponse } from "next/server";
import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifyServiceSid = process.env.TWILIO_VERIFY_SID!;

const client = Twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ success: false, error: "Phone and code required" }, { status: 400 });
    }

    const to = `+91${phone.replace(/^0+/, "")}`;

    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to,
        code,
      });

    if (verificationCheck.status === "approved") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("verify-otp error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
