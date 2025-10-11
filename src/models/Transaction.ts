// models/Transaction.ts
import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: { type: String, required: true },
  paymentMethod: { type: String },
  transactionDate: { type: Date, default: Date.now },
  subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription" },
  createdAt: { type: Date, default: Date.now },
});

const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);
export default Transaction;
