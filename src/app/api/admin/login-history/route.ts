import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import LoginHistory from "@/models/LoginHistory";
import User from "@/models/User"; // adjust if your user model is named differently

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  // 1️⃣ Check admin session
  if (!session || !session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    // 2️⃣ Fetch last 100 login records
    const logins = await LoginHistory.find({})
      .sort({ loginAt: -1 })
      .limit(100)
      .lean();

    // 3️⃣ Populate user info
    const loginsWithUsers = await Promise.all(
      logins.map(async (login) => {
        const user = await User.findById(login.userId).lean();
        return {
          _id: login._id,
          loginAt: login.loginAt,
          ipAddress: login.ipAddress,
          userAgent: login.userAgent,
          success: login.success,
          user: {
            email: user?.email || "Unknown",
            fullName: user?.name || null,
          },
        };
      })
    );

    return NextResponse.json(loginsWithUsers);
  } catch (error: any) {
    console.error("Error fetching login history:", error);
    return NextResponse.json(
      { error: "Failed to fetch login history" },
      { status: 500 }
    );
  }
}
