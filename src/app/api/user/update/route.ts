import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    console.log("🔹 Connecting to DB...");
    await connectDB();

    const session = await getServerSession(authOptions);
    console.log("🔹 Session:", session);

    const body = await req.json();
    console.log("🔹 Body received:", body);

    const email = body.email || session?.user?.email;
    if (!email) {
      console.log("❌ Unauthorized: No email found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData = {
      location: body.location,
      age: body.age,
      phone: body.phone,
      profileCompleted: true,
    };

    console.log("🔹 Updating user with email:", email);
    const updatedUser = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ User not found for email:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Profile updated successfully:", updatedUser);
    return NextResponse.json({ success: true, user: updatedUser });

  } catch (err) {
    console.error("❌ Profile update error:", err);
    return NextResponse.json(
      { error: "Failed to update profile", details: err},
      { status: 500 }
    );
  }
}
