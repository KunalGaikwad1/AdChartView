import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SubscriptionRecord from "@/models/SubscriptionRecord";
import Subscription from "@/models/Subscription";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      userId,
      amount,
    } = data;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
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

    const plan = await Subscription.findById(planId);
    let expiryDate = new Date();
    const duration = plan.duration.toLowerCase();

    // 🧠 extract number like 1, 3, 6 from "3 Months"
    const numberMatch = duration.match(/\d+/);
    const number = numberMatch ? parseInt(numberMatch[0]) : 1;

    if (duration.includes("month")) {
      expiryDate.setMonth(expiryDate.getMonth() + number);
    } else if (duration.includes("year")) {
      expiryDate.setFullYear(expiryDate.getFullYear() + number);
    } else if (duration.includes("day")) {
      expiryDate.setDate(expiryDate.getDate() + number);
    }

    // 3️⃣ Update user
    await User.findByIdAndUpdate(userId, {
      isSubscribed: true,
      planType: plan.planType, // equity/futures/options
      planExpiry: expiryDate,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
