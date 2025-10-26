import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import Tip from "@/models/Tip";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getIO } from "@/lib/socketServer";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 🧑‍💼 Admin → all tips
  if (user.role === "admin") {
    const allTips = await Tip.find().sort({ createdAt: -1 });
    return NextResponse.json(allTips);
  }

  // 👤 Normal user → check active subscription
  const now = new Date();
  if (user.isSubscribed && user.planExpiry && new Date(user.planExpiry) > now) {
    const allowedTips = await Tip.find({ category: user.planType }).sort({
      createdAt: -1,
    });
    return NextResponse.json(allowedTips);
  } else {
    const demoTips = await Tip.find({ isDemo: true }).sort({ createdAt: -1 });
    return NextResponse.json(demoTips);
  }
}

// 🆕 POST → Add new tip + notify users
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  // 1️⃣ Authentication check
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
      confidence,
      isDemo = false,
    } = body;

    // ✅ 3️⃣ Create tip in DB
    const newTip = await Tip.create({
      category,
      stockName: stock_name,
      action,
      entryPrice: entry_price,
      targetPrice: target_price,
      stopLoss: stop_loss,
      timeframe,
      confidence,
      isDemo,
      note,
      createdBy: session.user.id,
    });

    // ✅ 4️⃣ Find subscribed users for this category
    const subscribedUsers = await User.find({
      isSubscribed: true,
      planExpiry: { $gt: new Date() },
      planType: category,
    });

    // ✅ 5️⃣ Save notifications in DB
    const notifications = subscribedUsers.map((user) => ({
      userId: user._id,
      message: `New ${category} tip added: ${stock_name}`,
      seen: false,
      createdAt: new Date(),
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // ✅ 6️⃣ Send socket events safely
    const io = getIO();
    if (io) {
      subscribedUsers.forEach((user) => {
        io.emit("newNotification", {
          userId: user._id.toString(),
          message: `New ${category} tip added: ${stock_name}`,
          createdAt: new Date(),
        });
      });
    } else {
      console.warn("⚠️ Socket.io not initialized, skipping emit.");
    }

    return NextResponse.json(newTip, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tip:", error);
    return NextResponse.json(
      { error: "Error creating tip", details: error.message },
      { status: 500 }
    );
  }
}


// 🗑 DELETE → Delete tip
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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

// ✏️ PUT → Update tip
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  await connectDB();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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

    if (!id)
      return NextResponse.json(
        { error: "Tip ID is required" },
        { status: 400 }
      );

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
      { new: true }
    );

    if (!updatedTip)
      return NextResponse.json({ error: "Tip not found" }, { status: 404 });

    return NextResponse.json(updatedTip, { status: 200 });
  } catch (error: any) {
    console.error("Error updating tip:", error);
    return NextResponse.json(
      { error: "Error updating tip", details: error.message },
      { status: 500 }
    );
  }
}
