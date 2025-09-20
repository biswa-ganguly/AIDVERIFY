import express from "express";
import AdminLogin from "../controllers/AdminLogin.js";

const router=express.Router();

router.post("/login",AdminLogin);

export default router;