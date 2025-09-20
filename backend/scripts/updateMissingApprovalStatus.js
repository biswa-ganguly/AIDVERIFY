import mongoose from 'mongoose';
import NgoApplication from '../models/NgoApplication.js';
import dotenv from 'dotenv';

dotenv.config();

const updateMissingApprovalStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Update records that don't have AdminApproval field
    const result = await NgoApplication.updateMany(
      { AdminApproval: { $exists: false } },
      { $set: { AdminApproval: 'pending' } }
    );

    console.log(`Updated ${result.modifiedCount} records with missing AdminApproval field`);

    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

updateMissingApprovalStatus();