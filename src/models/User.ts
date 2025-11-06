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
    subscriptions: [
    {
      planType: { type: String,   enum: ["equity", "fno", "forex_crypto", null],},
      planExpiry: Date,
      isActive: Boolean,
    },
  ],
    oneSignalUserId: { type: String, default: null },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
