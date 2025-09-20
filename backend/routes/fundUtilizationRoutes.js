import express from "express";
import { createFundUtilization, getFundUtilizationsByNgo } from "../controllers/fundUtilizationController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.post("/", upload.single("receipt"), createFundUtilization);
router.get("/ngo/:ngoId", getFundUtilizationsByNgo);

export default router;