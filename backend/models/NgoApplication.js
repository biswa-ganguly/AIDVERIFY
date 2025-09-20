import mongoose from "mongoose";

const NgoApplicationSchema = new mongoose.Schema({
  ngoName: String,
  registrationNumber: String,
  ngoID: {type:String , default:"" },
  website: String,
  contactPerson: String,
  designation: String,
  email: {type:String},
  phone: String,

  campaignTitle: String,
  tagline: String,
  category: String,
  location: String,
  startDate: String,
  endDate: String,
  description: String,
  beneficiaries: String,
  goalAmount: Number,
  receivedAmount:{ type:Number , default:0},
  campaignID: {type:String , default: "" },

  story: String,
  outcomes: String,

  accountNumber: String,
  ifscCode: String,
  bankName: String,

  // Uploaded Files (store Cloudinary URLs)
  documents: {
    ngoCertificate: String,
    financialStatement: String,
    idProof: String,
    fieldImages: String,
    cancelledCheque: String,
  },

  // Legal
  terms: Boolean,
  authenticity: Boolean,
  signature: String,
  AdminApproval: { type:String , default:"pending"},
  AIApproval: { type:String , default:"pending"},
}, { timestamps: true });

export default mongoose.model("NgoApplication", NgoApplicationSchema);
