import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await connectDB();

  const subs = await Subscription.find({ isActive: true })
    .populate("userId", "email name")
    .sort({ subscribedAt: -1 });

  const formatted = subs.map((sub: any) => ({
    id: sub._id,
    user: {
      email: sub.userId?.email,
      name: sub.userId?.name,
    },
    subscribedAt: sub.subscribedAt,
    expiresAt: sub.expiresAt,
    isActive: sub.isActive,
  }));

  return NextResponse.json(formatted);
}
