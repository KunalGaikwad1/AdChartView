import { NextResponse } from "next/server";
import  { connectDB } from "@/lib/mongodb";
import Subscription from "@/models/Subscription";

export async function GET() {
  await connectDB();
  const plans = await Subscription.find().sort({ createdAt: -1 });
  return NextResponse.json(plans);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const plan = await Subscription.create(body);
  return NextResponse.json(plan);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  await Subscription.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
