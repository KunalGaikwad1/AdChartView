// models/Subscription.ts
import mongoose, { Schema, model } from "mongoose";

const SubscriptionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  isActive: { type: Boolean, default: false },
  subscribedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
});

const Subscription =
  mongoose.models.Subscription || model("Subscription", SubscriptionSchema);
export default Subscription;
