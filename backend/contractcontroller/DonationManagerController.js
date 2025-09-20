import { ethers } from "ethers";
import DonorManager_json from "../../blockchain/build/contracts/DonorManager.json" with { type: "json" };
import DonationManager_json from "../../blockchain/build/contracts/DonationManager.json" with { type: "json" };
import deploycontractaddresses from "../deployed.json" with { type: "json" };

// Blockchain disabled - using mock implementations
const DonorManager_abi = DonorManager_json.abi;
const DonationManager_abi = DonationManager_json.abi;

// Mock function to register Donor
export const RegisterDonor = async (
  contractAddress,
  walletPrivateKey,
  donorUserName,
  isVerified
) => {
  console.log("Blockchain disabled, returning mock donor registration");
  return {
    donorId: `mock_${Date.now()}`,
    donorUserName: donorUserName,
    isVerified: true,
  };
};

// Mock function to get donor by username
export const getDonor = async (contractAddress, username) => {
  console.log("Blockchain disabled, returning mock donor data");
  return {
    donorId: null,
    donorUserName: null,
    isVerified: false,
  };
};

// Mock function to make a donation
export const donate = async (
    walletPrivateKey,
    transactionId,
    campaignId,
    donorId,
    donorUserName,
    amount,
    proofHash
) => {
    console.log("Blockchain disabled, mock donation recorded:", {
        transactionId,
        campaignId,
        donorId,
        amount
    });
};

// Mock function to get all donations by a donor's blockchain ID
export const getDonationsByDonorId = async (donorId) => {
    console.log("Blockchain disabled, returning empty donations array");
    return [];
};

// Mock function to get all donations by a donor's username
export const getDonationsByDonorUsername = async (donorUsername) => {
    console.log("Blockchain disabled, returning empty donations array");
    return [];
};