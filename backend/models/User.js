import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, default: "Donor" },
  blockchainId: {
    type: String,
    default:""
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
