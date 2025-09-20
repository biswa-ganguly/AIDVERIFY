import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true
  },
  campaignId: {
    type: String,
    required: true
  },
  donorId: {
    type: String,
    required: true
  },
  donorBlockchainId:{
    type: String,
    required: true
  },
  donorEmail: {
    type: String,
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    default: "UPI"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed"
  },
  paymentProofPic: {
    type: String, // URL or file path
    required: false,
  },
  paymentProofHash: {
    type: String, // hash stored from IPFS or blockchain
    required: false,
    default: "",
  },
  paymentProofHashPic: {
    type: String, // Pic public gateway stored from IPFS or blockchain
    required: false,
    default: "",
  }
}, { 
  timestamps: true 
});

export default mongoose.model("Transaction", TransactionSchema);
