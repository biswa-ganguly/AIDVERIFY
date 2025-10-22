import express from "express";
import { NGOApprovalFunction, getAIResponses } from "../controllers/AdminController.js";

const router=express.Router();
 
router.post("/approval",NGOApprovalFunction);
router.get("/ai-responses", getAIResponses);

export default router;  