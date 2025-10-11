import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import Tip from "@/models/Tip";
import Transaction from "@/models/Transaction";
import LoginHistory from "@/models/LoginHistory";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await connectDB();

  const [totalUsers, activeSubscribers, totalRevenueData, tips, recentLogins] =
    await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ isActive: true }),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Tip.find(),
      LoginHistory.countDocuments({
        loginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

  const totalRevenue =
    totalRevenueData.length > 0 ? totalRevenueData[0].total : 0;
  const demoTips = tips.filter((t) => t.isDemo).length;

  return NextResponse.json({
    totalUsers,
    activeSubscribers,
    totalRevenue,
    totalTips: tips.length,
    demoTips,
    recentLogins,
  });
}
