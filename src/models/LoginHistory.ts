// models/LoginHistory.ts
import { Schema, model, models } from "mongoose";

const LoginHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  loginAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  success: { type: Boolean, default: true },
});

const LoginHistory =
  models.LoginHistory || model("LoginHistory", LoginHistorySchema);
export default LoginHistory;
