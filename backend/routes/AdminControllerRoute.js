import express from "express";
import { NGOApprovalFunction } from "../controllers/AdminController.js";

const router=express.Router();

router.post("/approval",NGOApprovalFunction);

export default router; 