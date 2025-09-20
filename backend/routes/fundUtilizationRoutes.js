import express from "express";
import { createFundUtilization, getFundUtilizationsByNgo, getFundUtilizationsByDonor, downloadReceipt } from "../controllers/fundUtilizationController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post("/", upload.single("receipt"), createFundUtilization);
router.get("/ngo/:ngoId", getFundUtilizationsByNgo);
router.get("/donor/:donorEmail", getFundUtilizationsByDonor);
router.get("/receipt/:utilizationId", downloadReceipt);

export default router;