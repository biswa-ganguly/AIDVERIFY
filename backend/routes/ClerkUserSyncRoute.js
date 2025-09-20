import express from "express";
import { ClerkUserSync } from "../controllers/ClerkUserSync.js";
import User from "../models/User.js";

const router=express.Router();

router.post("/sync",ClerkUserSync);

router.post('/create-or-update', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, role } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const user = await User.findOneAndUpdate(
      { clerkId }, 
      { email, firstName, lastName, role }, 
      { upsert: true, new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;