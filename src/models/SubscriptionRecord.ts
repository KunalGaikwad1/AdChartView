import mongoose from "mongoose";

const SubscriptionRecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  planId: { type: String, required: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "success" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.SubscriptionRecord ||
  mongoose.model("SubscriptionRecord", SubscriptionRecordSchema);
