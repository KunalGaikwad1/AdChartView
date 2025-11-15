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

  // 👤 Normal user → check active subscriptions
  const now = new Date();
  const activePlans =
    user.subscriptions
      ?.filter((sub: any) => new Date(sub.planExpiry) > now)
      .map((sub: any) => sub.planType) || [];

  if (activePlans.length > 0) {
    const allowedTips = await Tip.find({
      category: { $in: activePlans },
    }).sort({ createdAt: -1 });

    return NextResponse.json(allowedTips);
  }

  // 🪶 If no active plan → show demo tips only
  const demoTips = await Tip.find({ isDemo: true }).sort({ createdAt: -1 });
  return NextResponse.json(demoTips);
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

    // ✅ 4️⃣ Find subscribed users (with active plan matching tip category)
    // const subscribedUsers = await User.find({
    //   subscriptions: {
    //     $elemMatch: {
    //       planType: category,
    //       planExpiry: { $gt: new Date() },
    //       isActive: true,
    //     },
    //   },
    // });
    const subscribedUsers = await User.find({
      subscriptions: {
        $elemMatch: {
          planType: category,
          planExpiry: { $gt: new Date() },
          isActive: true,
        },
      },
      oneSignalUserId: { $exists: true, $ne: null },
    });
    console.log(subscribedUsers);

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

    // // ✅ 6️⃣ Send socket events safely
    // const io = getIO();
    // if (io) {
    //   subscribedUsers.forEach((user) => {
    //     io.emit("newNotification", {
    //       userId: user._id.toString(),
    //       message: `New ${category} tip added: ${stock_name}`,
    //       createdAt: new Date(),
    //     });
    //   });
    // } else {
    //   console.warn("⚠️ Socket.io not initialized, skipping emit.");
    // }
    // ✅ 7️⃣ Send push notifications via OneSignal (single request for all)
    const onesignalTargetIds = subscribedUsers
      .map((u) => u.oneSignalUserId)
      .filter(Boolean); // remove null/undefined

    console.log(
      "🧩 OneSignal Push Start: ",
      onesignalTargetIds.length,
      "users"
    );

    if (onesignalTargetIds.length > 0) {
      try {
        await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          },
          body: JSON.stringify({
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: onesignalTargetIds, // THE KEY THAT WORKS
            headings: { en: "📈 New Tip Added!" },
            contents: { en: `${category.toUpperCase()} — ${stock_name}` },
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/tips`,
          }),
        });
      } catch (err) {
        console.error("Error sending OneSignal push:", err);
      }
    }

    // ✅ 8️⃣ Send socket events targeted to each user's room (if socket is available)
    const io = getIO();
    if (io) {
      subscribedUsers.forEach((user) => {
        if (!user._id) return;
        // use the user's id as the room name (client joins this room)
        try {
          io.to(user._id.toString()).emit("newNotification", {
            userId: user._id.toString(),
            message: `New ${category} tip added: ${stock_name}`,
            createdAt: new Date(),
          });
        } catch (err) {
          console.warn("Socket emit failed for user:", user._id, err);
        }
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

// DELETE & PUT remain the same
