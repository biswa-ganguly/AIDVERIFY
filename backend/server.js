import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

//Imports from Files
import ocrRoutes from "./routes/ocrRoutes.js";
import clerkusersyncroute from "./routes/ClerkUserSyncRoute.js";
import ngoApplicationRoutes from "./routes/ngoApplicationRoutes.js";
import AdminLoginRoute from "./routes/AdminLoginRoute.js";
import setUserRoleRoute from "./routes/setUserRoleRoute.js";
import AdminControllerRoute from "./routes/AdminControllerRoute.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import fundUtilizationRoutes from "./routes/fundUtilizationRoutes.js";
import tokenRewardRoutes from "./routes/tokenRewardRoutes.js";
import crowdfundingRoutes from "./routes/crowdfundingRoutes.js";

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

//Routes
app.use("/api/ocr", ocrRoutes);
app.use("/api/clerk",clerkusersyncroute);
app.use("/api/ngo", ngoApplicationRoutes);
app.use("/api/admin", AdminLoginRoute);
app.use("/api/admin", AdminControllerRoute);
app.use("/api/user", setUserRoleRoute);
app.use("/api/transaction", transactionRoutes);
app.use("/api/fund-utilization", fundUtilizationRoutes);
app.use("/api/tokens", tokenRewardRoutes);
app.use("/api/crowdfunding", crowdfundingRoutes);

//Test Route
app.get("/",(req,res)=>{
    res.send("Welcome From Server");
})

const connectDB = async() =>
{
  try 
  {
    const MONGO=process.env.MONGODB_URL;
    await  mongoose.connect(MONGO);
    console.log("✅ MONGODB CONNECTED SUCCESSFULLY");
  } 
  catch (error) {
      console.log("❌ ERROR IN MONGO CONNECTION:",error);
  }
}

connectDB();

// Drop unique indexes (run once)
// mongoose.connection.once('open', async () => {
//   try {
//     await mongoose.connection.db.collection('ngoapplications').dropIndex('ngoID_1');
//     console.log('✅ Dropped ngoID unique index');
//   } catch (error) {
//     console.log('ngoID index may not exist:', error.message);
//   }
  
//   try {
//     await mongoose.connection.db.collection('ngoapplications').dropIndex('email_1');
//     console.log('✅ Dropped email unique index');
//   } catch (error) {
//     console.log('email index may not exist:', error.message);
//   }
// });

const PORT=process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT:${PORT}`);
});
