import mongoose from "mongoose";

const crowdfundingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  creatorId: { type: String, required: true },
  creatorEmail: { type: String, required: true },
  category: { type: String, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  image: { type: String },
  contributors: [{
    userId: String,
    email: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }],
  milestones: [{
    title: String,
    description: String,
    targetAmount: Number,
    achieved: { type: Boolean, default: false },
    achievedDate: Date
  }]
}, { timestamps: true });

export default mongoose.model("Crowdfunding", crowdfundingSchema);