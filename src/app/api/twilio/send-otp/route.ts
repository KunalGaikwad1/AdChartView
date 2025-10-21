import { NextResponse } from "next/server";
import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const verifyServiceSid = process.env.TWILIO_VERIFY_SID!;

const client = Twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }

    // Always include +91 for India
    const to = `+91${phone.replace(/^0+/, "")}`;

    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to,
        channel: "sms",
      });

    return NextResponse.json({ success: true, sid: verification.sid });
  } catch (err: any) {
    console.error("send-otp error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
