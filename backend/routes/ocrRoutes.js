import express from "express";
import upload from "../config/multerConfig.js";
import { processOCR } from "../controllers/ocrController.js";

const router = express.Router();

// POST /api/ocr/upload
router.post("/upload", upload.single("file"), processOCR);

export default router;
