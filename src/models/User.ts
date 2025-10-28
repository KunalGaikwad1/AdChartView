import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    image: String,
    role: { type: String, default: "user" }, // user or admin
    location: String,
    age: Number,
    phone: String,
    profileCompleted: { type: Boolean, default: false },
    isSubscribed: { type: Boolean, default: false },
    planType: {
      type: String,
      enum: ["equity", "futures", "options", null],
      default: null,
    },
    planExpiry: { type: Date, default: null },
    oneSignalUserId: { type: String, default: null },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
