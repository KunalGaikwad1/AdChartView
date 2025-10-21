import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import Tip from "@/models/Tip";
import Subscription from "@/models/Subscription";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  // 1️⃣ If no session → unauthorized
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userRole = session.user.role;

  // 2️⃣ If admin → return all tips
  if (userRole === "admin") {
    const allTips = await Tip.find().sort({ updatedAt: -1 });
    return NextResponse.json(allTips);
  }

  // 3️⃣ For user → check active subscription
  const sub = await Subscription.findOne({
    userId: session.user.id,
    isActive: true,
  });

  // 4️⃣ Return tips based on subscription
  if (sub) {
    const allTips = await Tip.find().sort({ createdAt: -1 });
    return NextResponse.json(allTips);
  } else {
    const demoTips = await Tip.find({ isDemo: true }).sort({ createdAt: -1 });
    return NextResponse.json(demoTips);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  // 1️⃣ If not logged in
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2️⃣ Only admin can post tips
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      category,
      stock_name,
      action,
      entry_price,
      target_price,
      stop_loss,
      timeframe,
      note,
      isDemo = false,
    } = body;

    // 3️⃣ Create new tip
    const newTip = await Tip.create({
      category,
      stockName: stock_name,
      action,
      entryPrice: entry_price,
      targetPrice: target_price,
      stopLoss: stop_loss,
      timeframe,
      isDemo,
      note,
      createdBy: session.user.id,
    });

    return NextResponse.json(newTip, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tip:", error);
    return NextResponse.json(
      { error: "Error creating tip", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  // 1️⃣ Check authentication
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2️⃣ Only admin can delete tips
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Tip ID is required" },
        { status: 400 }
      );
    }

    const deletedTip = await Tip.findByIdAndDelete(id);

    if (!deletedTip) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tip deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting tip:", error);
    return NextResponse.json(
      { error: "Error deleting tip", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  // 1️⃣ Check authentication
  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2️⃣ Only admin can update tips
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id,
      category,
      stock_name,
      action,
      entry_price,
      target_price,
      stop_loss,
      timeframe,
      note,
      isDemo,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Tip ID is required" },
        { status: 400 }
      );
    }

    // 3️⃣ Update the tip
    const updatedTip = await Tip.findByIdAndUpdate(
      id,
      {
        category,
        stockName: stock_name,
        action,
        entryPrice: entry_price,
        targetPrice: target_price,
        stopLoss: stop_loss,
        timeframe,
        isDemo,
        note,
      },
      { new: true } // return the updated document
    );

    if (!updatedTip) {
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTip, { status: 200 });
  } catch (error: any) {
    console.error("Error updating tip:", error);
    return NextResponse.json(
      { error: "Error updating tip", details: error.message },
      { status: 500 }
    );
  }
}
