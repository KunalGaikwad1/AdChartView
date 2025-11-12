import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  console.log("SESSION EMAIL:", session?.user?.email);

  const { oneSignalUserId } = await req.json();
  console.log("RECEIVED ID:", oneSignalUserId);

  if (!session?.user?.email)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const updated = await User.findOneAndUpdate(
    { email: session.user.email },
    { oneSignalUserId },
    { new: true }
  );

  console.log("UPDATED USER:", updated);
  return NextResponse.json({ success: true });
}

