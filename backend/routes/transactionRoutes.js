import express from "express";
import { createTransaction, getTransactionsByDonor, getTransactionsByCampaign, getDonorStats, getCampaignStats } from "../controllers/transactionController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post("/", upload.single("paymentProofPic"), createTransaction);
router.get("/donor/:donorId", getTransactionsByDonor);
router.get("/campaign/:campaignId", getTransactionsByCampaign);
router.get("/donor-stats/:donorId", getDonorStats);
router.get("/campaign-stats/:campaignId", getCampaignStats);

export default router;