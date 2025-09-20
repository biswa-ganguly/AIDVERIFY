import mongoose from "mongoose";

const FundUtilizationSchema = new mongoose.Schema({
  ngoId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  items: {
    type: String,
    required: true
  },
  receiptUrl: {
    type: String,
    required: true
  },
  receiptHash: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Pending", "Verified"],
    default: "Pending"
  },
  txHash: {
    type: String,
    default: "N/A"
  }
}, { 
  timestamps: true 
});

export default mongoose.model("FundUtilization", FundUtilizationSchema);