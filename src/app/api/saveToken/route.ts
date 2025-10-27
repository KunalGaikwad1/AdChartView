import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const { token } = await req.json();

    if (!session?.user?.email)
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    await User.findOneAndUpdate(
      { email: session.user.email },
      { fcmToken: token },
      { new: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving FCM token:", err);
    return NextResponse.json({ error: "Failed to save token" }, { status: 500 });
  }
}
