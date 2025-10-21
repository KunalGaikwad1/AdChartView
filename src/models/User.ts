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
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
