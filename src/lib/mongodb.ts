import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected:", db.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
};
