import { clerkClient } from '@clerk/clerk-sdk-node';

export const setUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and role are required' 
      });
    }

    // Update user's public metadata in Clerk
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    });

    res.json({ 
      success: true, 
      message: `Role ${role} set successfully` 
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to set user role' 
    });
  }
};