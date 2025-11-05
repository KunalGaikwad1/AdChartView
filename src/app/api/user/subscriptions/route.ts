import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  await connectDB();

  if (!session || !session.user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await User.findOne({ email: session.user.email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const activePlans =
    user.subscriptions?.filter(
      (sub: any) => new Date(sub.planExpiry) > now
    ) || [];

  return NextResponse.json({ activePlans });
}
