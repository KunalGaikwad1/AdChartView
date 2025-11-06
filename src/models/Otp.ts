import mongoose, { Schema, models } from "mongoose";

const OtpSchema = new Schema(
  {
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // ✅ TTL INDEX
  },
  { timestamps: true }
);

export default models.Otp || mongoose.model("Otp", OtpSchema);
