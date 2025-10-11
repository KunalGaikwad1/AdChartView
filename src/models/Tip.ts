// models/Tip.ts
import mongoose, { Schema, model } from "mongoose";

const TipSchema = new Schema({
  category: {
    type: String,
    enum: ["equity", "futures", "options"],
    required: true,
  },
  stockName: { type: String, required: true },
  action: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  targetPrice: { type: Number, required: true },
  stopLoss: { type: Number, required: true },
  timeframe: { type: String, required: true },
  confidence: { type: String, required: true },
  isDemo: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Tip = mongoose.models.Tip || model("Tip", TipSchema);
export default Tip;
