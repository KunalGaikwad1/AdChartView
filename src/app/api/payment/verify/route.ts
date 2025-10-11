import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SubscriptionRecord from "@/models/SubscriptionRecord";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, userId, amount } = data;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    await connectDB();
    await SubscriptionRecord.create({
      userId,
      planId,
      paymentId: razorpay_payment_id,
      amount,
      status: "success",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify Error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
