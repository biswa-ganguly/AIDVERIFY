import FundUtilization from "../models/FundUtilization.js";
import NgoApplication from "../models/NgoApplication.js";
import Transaction from "../models/Transaction.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import fetch from "node-fetch";

export const createFundUtilization = async (req, res) => {
  try {
    const { userEmail, amount, items } = req.body;

    if (!userEmail || !amount || !items || !req.file) {
      return res.status(400).json({
        success: false,
        error: "All fields including receipt file are required"
      });
    }

    const ngo = await NgoApplication.findOne({ email: userEmail });
    if (!ngo) {
      return res.status(404).json({
        success: false,
        error: "NGO not found"
      });
    }

    const uploadToCloudinary = (fileBuffer, folder) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      });
    };

    const receiptUrl = await uploadToCloudinary(req.file.buffer, "AidVerify/fundUtilization");

    const newUtilization = new FundUtilization({
      ngoId: ngo.ngoID,
      amount: parseFloat(amount),
      items,
      receiptUrl,
      receiptHash: ""
    });

    await newUtilization.save();

    res.status(201).json({
      success: true,
      message: "Fund utilization recorded successfully",
      data: newUtilization
    });
  } catch (error) {
    console.error("Error creating fund utilization:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getFundUtilizationsByNgo = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const utilizations = await FundUtilization.find({ ngoId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: utilizations
    });
  } catch (error) {
    console.error("Error fetching fund utilizations:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getFundUtilizationsByDonor = async (req, res) => {
  try {
    const { donorEmail } = req.params;
    
    const transactions = await Transaction.find({ donorEmail });
    const campaignIds = [...new Set(transactions.map(t => t.campaignId))];
    
    const ngos = await NgoApplication.find({ ngoID: { $in: campaignIds } });
    const ngoIds = ngos.map(ngo => ngo.ngoID);
    
    const utilizations = await FundUtilization.find({ ngoId: { $in: ngoIds } })
      .sort({ createdAt: -1 });
    
    const utilizationsWithNgo = utilizations.map(util => {
      const ngo = ngos.find(n => n.ngoID === util.ngoId);
      return {
        ...util.toObject(),
        ngoName: ngo?.ngoName || 'Unknown NGO',
        ngoEmail: ngo?.email || 'Unknown Email'
      };
    });

    res.status(200).json({
      success: true,
      data: utilizationsWithNgo
    });
  } catch (error) {
    console.error("Error fetching donor fund utilizations:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const downloadReceipt = async (req, res) => {
  try {
    const { utilizationId } = req.params;
    
    const utilization = await FundUtilization.findById(utilizationId);
    if (!utilization) {
      return res.status(404).json({
        success: false,
        error: "Fund utilization not found"
      });
    }

    const response = await fetch(utilization.receiptUrl);
    if (!response.ok) {
      return res.status(404).json({
        success: false,
        error: "Receipt file not found"
      });
    }

    const buffer = await response.buffer();
    const filename = `receipt_${utilizationId}.${utilization.receiptUrl.split('.').pop()}`;
    
    res.set({
      'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading receipt:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};