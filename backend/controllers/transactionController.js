import Transaction from "../models/Transaction.js";
import NgoApplication from "../models/NgoApplication.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { RegisterDonor, getDonor, donate } from "../contractcontroller/DonationManagerController.js";
import { awardTokens } from "./tokenRewardController.js";
import deploycontractaddresses from "../deployed.json" with { type: "json" };
import { create as ipfsClient } from "ipfs-http-client";
import { ethers } from "ethers";

// IPFS connection disabled to avoid connection issues
// const ipfs = ipfsClient({
//     url: process.env.IPFS_PUBLIC,
//     port: 443,
//     protocol: 'https'
// });

export const createTransaction = async (req, res) => {
    try {
        const {
            transactionId,
            amount,
            campaignId,
            donorId,
            donorEmail,
            donorName,
            paymentMethod
        } = req.body;

        if (!transactionId || !amount || !campaignId || !donorId || !donorEmail || !donorName) {
            return res.status(400).json({
                success: false,
                error: "All required fields must be provided"
            });
        }

        const existingTransaction = await Transaction.findOne({ transactionId });
        if (existingTransaction) {
            return res.status(400).json({
                success: false,
                error: "The transaction already exists"
            });
        }

        let paymentProofPic = null;
        let paymentProofHash = "";
        let paymentProofHashPic = "";
        const donorregistrationaddress = deploycontractaddresses.donorAddress;
        const donationcontractaddress = deploycontractaddresses.donationAddress;

        // ✅ If a file is uploaded, upload to Cloudinary only
        if (req.file) {
            const streamUpload = (reqFile) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream(
                        { folder: "AidVerify/donorTransactions" },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(reqFile.buffer).pipe(stream);
                });
            };
            const cloudinaryResult = await streamUpload(req.file);
            paymentProofPic = cloudinaryResult.secure_url;
            paymentProofHash = "cloudinary_only";
            paymentProofHashPic = cloudinaryResult.secure_url;
        }

        // 1. Check if the donor is already registered and verified
        let isDonorVerified = false;
        let donorBlockchainId = "";

        const registeredDonor = await getDonor(donorregistrationaddress, donorEmail);

        if (registeredDonor && registeredDonor.donorId) {
            isDonorVerified = registeredDonor.isVerified;
            donorBlockchainId = registeredDonor.donorId;
        }

        // 2. Register the donor only if not already verified
        if (!isDonorVerified) {
            const donordetails = await RegisterDonor(
                donorregistrationaddress,
                process.env.NGO_PRIVATE_KEY,
                donorEmail,
                true
            );
            console.log("Newly registered donor details:", donordetails);
            donorBlockchainId = donordetails.donorId; // Set the blockchain ID from the registration
        } else {
            console.log("Donor is already verified, skipping registration.");
        }

        // 3. Record the donation on the blockchain
        const donationId = transactionId;
        await donate(
            process.env.NGO_PRIVATE_KEY,
            donationId,
            campaignId,
            donorBlockchainId,
            donorEmail,
            amount,
            paymentProofHash
        );

        // 4. Save the transaction to MongoDB
        const newTransaction = new Transaction({
            transactionId,
            amount,
            campaignId,
            donorId,
            donorEmail,
            donorName,
            donorBlockchainId: donorBlockchainId,
            paymentMethod: paymentMethod || "UPI",
            status: "completed",
            paymentProofPic,
            paymentProofHash,
            paymentProofHashPic
        });

        await newTransaction.save();

        // Award tokens for donation
        const tokensAwarded = await awardTokens(donorId, donorEmail, amount, campaignId);

        // Update campaign receivedAmount
        const campaign = await NgoApplication.findOne({ campaignID: campaignId });
        if (campaign) {
            const currentAmount = Number(campaign.receivedAmount) || 0;
            const newAmount = currentAmount + Number(amount);
            await NgoApplication.findOneAndUpdate(
                { campaignID: campaignId },
                { receivedAmount: newAmount }
            );
        }

        res.status(201).json({
            success: true,
            message: "Transaction recorded successfully",
            data: newTransaction,
            tokensAwarded
        });
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getTransactionsByDonor = async (req, res) => {
    try {
        const { donorId } = req.params;
        const transactions = await Transaction.find({ donorId });

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getTransactionsByCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const transactions = await Transaction.find({ campaignId });

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error("Error fetching campaign transactions:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getCampaignStats = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaign = await NgoApplication.findOne({ campaignID: campaignId });
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found"
            });
        }

        const percentage = (campaign.receivedAmount / campaign.goalAmount) * 100;

        res.status(200).json({
            success: true,
            data: {
                campaignId,
                goalAmount: campaign.goalAmount,
                receivedAmount: campaign.receivedAmount,
                percentage: Math.round(percentage * 100) / 100
            }
        });
    } catch (error) {
        console.error("Error fetching campaign stats:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getDonorStats = async (req, res) => {
    try {
        const { donorId } = req.params;

        const stats = await Transaction.aggregate([
            { $match: { donorId } },
            {
                $group: {
                    _id: "$donorId",
                    totalAmount: { $sum: "$amount" },
                    campaigns: { $addToSet: "$campaignId" }
                }
            },
            {
                $project: {
                    _id: 0,
                    donorId: "$_id",
                    totalAmount: 1,
                    totalCampaigns: { $size: "$campaigns" }
                }
            }
        ]);

        if (!stats.length) {
            return res.status(404).json({
                success: false,
                message: "No transactions found for this donor"
            });
        }

        res.status(200).json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error("Error fetching donor stats:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};