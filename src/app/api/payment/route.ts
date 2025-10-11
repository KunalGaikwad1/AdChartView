import Razorpay from "razorpay";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, planId, userId } = await req.json();

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Math.random()}`,
      notes: {
        planId,
        userId,
      },
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
