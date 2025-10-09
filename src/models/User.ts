import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    image: String,
    role: { type: String, default: "user" }, // user or admin
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
