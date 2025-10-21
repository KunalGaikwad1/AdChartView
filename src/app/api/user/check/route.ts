import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ profileCompleted: true });

  const user = await User.findOne({ email: session.user.email });
  return NextResponse.json({
    profileCompleted: user?.profileCompleted || false,
  });
}
