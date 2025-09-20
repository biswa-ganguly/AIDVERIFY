//After login of Donors or NGO stores in DB from Clerk
import User from "../models/User.js";

export const ClerkUserSync = async(req,res) =>
{
    try {
    const { clerkId, email, firstName, lastName, role } = req.body;

    // upsert → insert if not exists, otherwise update
    const user = await User.findOneAndUpdate(
      { clerkId },  // search by Clerk ID
      { email, firstName, lastName, role },
      { new: true, upsert: true } // create if not exists
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}