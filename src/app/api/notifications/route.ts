import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/Notification";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });

  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(notifications);
}

export async function PATCH() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });

  await Notification.updateMany({ userId: session.user.id, seen: false }, { seen: true });

  return NextResponse.json({ success: true });
}
