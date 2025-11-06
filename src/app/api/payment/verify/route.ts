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

    // 🧩 1️⃣ Verify Razorpay signature
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

    // 🧩 2️⃣ Save payment record
    await connectDB();
    await SubscriptionRecord.create({
      userId,
      planId,
      paymentId: razorpay_payment_id,
      amount,
      status: "success",
      createdAt: new Date(),
    });

    // 🧩 3️⃣ Fetch plan and calculate expiry
    const plan = await Subscription.findById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    let expiryDate = new Date();
    const duration = plan.duration.toLowerCase();
    const numberMatch = duration.match(/\d+/);
    const number = numberMatch ? parseInt(numberMatch[0]) : 1;

    if (duration.includes("month")) {
      expiryDate.setMonth(expiryDate.getMonth() + number);
    } else if (duration.includes("year")) {
      expiryDate.setFullYear(expiryDate.getFullYear() + number);
    } else if (duration.includes("day")) {
      expiryDate.setDate(expiryDate.getDate() + number);
    }

    // 🧩 4️⃣ Get user and check active plan rule
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Make sure subscriptions array exists
    user.subscriptions = user.subscriptions || [];

    // 🧠 Map plan name to internal key
    const planTypeMap: Record<string, string> = {
      "Equity Tips Plan": "equity",
      "FnO Tips Plan": "fno",
      "Forex & Crypto Plan": "forex_crypto",
    };

    const normalizedPlanType =
      planTypeMap[plan.name?.trim()] || plan.planType || "equity";

    // 🔍 Check if same plan type is already active
    const activePlan = user.subscriptions.find(
      (sub: any) =>
        sub.planType === normalizedPlanType &&
        new Date(sub.planExpiry) > new Date()
    );

    if (activePlan) {
      return NextResponse.json(
        {
          success: false,
          message: `You already have an active ${normalizedPlanType} plan until ${new Date(
            activePlan.planExpiry
          ).toLocaleDateString()}.`,
        },
        { status: 400 }
      );
    }

    // 🧩 5️⃣ Add new plan entry
    user.subscriptions.push({
      planType: normalizedPlanType,
      planExpiry: expiryDate,
      isActive: true,
    });

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Verify Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
