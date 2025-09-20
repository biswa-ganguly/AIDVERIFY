import mongoose from "mongoose";

const tokenRewardSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  totalTokens: { type: Number, default: 0 },
  earnedTokens: { type: Number, default: 0 },
  redeemedTokens: { type: Number, default: 0 },
  transactions: [{
    type: { type: String, enum: ['earned', 'redeemed'], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    campaignId: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("TokenReward", tokenRewardSchema);