import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import CampaignManager_json from "../../blockchain/build/contracts/CampaignManager.json" with { type: "json" };
import NGOManager_json from "../../blockchain/build/contracts/NGOManager.json" with { type: "json" };
import DonorManager_json from "../../blockchain/build/contracts/DonorManager.json" with { type: "json" };
import DonoationManager_json from "../../blockchain/build/contracts/DonationManager.json" with { type: "json" };

dotenv.config(); // ✅ load variables from .env

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const deployerprivatekey = process.env.PRIVATE_KEY;
const deployerwallet = new ethers.Wallet(deployerprivatekey, provider);

// ABI + Bytecode
const CampaignManager_abi = CampaignManager_json.abi;
const CampaignManager_bytecode = CampaignManager_json.bytecode;
const NgoManager_abi = NGOManager_json.abi;
const NgoManager_bytecode = NGOManager_json.bytecode;
const DonorManager_abi = DonorManager_json.abi;
const DonorManager_bytecode = DonorManager_json.bytecode;
const DonoationManager_abi = DonoationManager_json.abi;
const DonoationManager_bytecode = DonoationManager_json.bytecode;


// Contract Factories
const CampaignManagerfactory = new ethers.ContractFactory(
  CampaignManager_abi,
  CampaignManager_bytecode,
  deployerwallet
);

const NgoManagerfactory = new ethers.ContractFactory(
  NgoManager_abi,
  NgoManager_bytecode,
  deployerwallet
);

const DonorManagerfactory = new ethers.ContractFactory(
  DonorManager_abi,
  DonorManager_bytecode,
  deployerwallet
);

const DonationManagerfactory = new ethers.ContractFactory(
  DonoationManager_abi,
  DonoationManager_bytecode,
  deployerwallet
)

// Deploy CampaignManager
const CampaignManagerdeploy = async () => {
  try {
    console.log("Deploying Contract CampaignManager...");

    const contract = await CampaignManagerfactory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ CampaignManager Contract deployed at address:", contractAddress);
    return contractAddress;
  } catch (error) {
    console.log("❌ Error deploying CampaignManager:", error);
  }
};

// Deploy NgoManager with fresh nonce
const NgoManagerdeploy = async () => {
  try {
    console.log("Deploying Contract NgoManager...");

    // 🔑 Fetch fresh nonce to avoid "nonce too low"
    const nonce = await provider.getTransactionCount(deployerwallet.address, "latest");

    const contract = await NgoManagerfactory.deploy({ nonce });
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ NgoManager Contract deployed at address:", contractAddress);
    return contractAddress;
  } catch (error) {
    console.log("❌ Error deploying NgoManager:", error);
  }
};

// Deploy DonorManager with fresh nonce
const DonorManagerdeploy = async () => {
  try {
    console.log("Deploying Contract DonorManager...");

    // 🔑 Fetch fresh nonce to avoid "nonce too low"
    const nonce = await provider.getTransactionCount(deployerwallet.address, "latest");

    const contract = await DonorManagerfactory.deploy({ nonce });
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ DonorManager Contract deployed at address:", contractAddress);
    return contractAddress;
  } catch (error) {
    console.log("❌ Error deploying DonorManager:", error);
  }
};

// Deploy DonorManager with fresh nonce
const DonationManagerdeploy = async () => {
  try {
    console.log("Deploying Contract DonationManager...");

    // 🔑 Fetch fresh nonce to avoid "nonce too low"
    const nonce = await provider.getTransactionCount(deployerwallet.address, "latest");

    const contract = await DonationManagerfactory.deploy({ nonce });
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ DonationManager Contract deployed at address:", contractAddress);
    return contractAddress;
  } catch (error) {
    console.log("❌ Error deploying DonationManager:", error);
  }
};

const main = async () => {
  const campaignAddress = await CampaignManagerdeploy();
  console.log("CampaignManager done:", campaignAddress);

  // ⏳ Small delay to let Ganache settle
  await new Promise((res) => setTimeout(res, 2000));

  const ngoAddress = await NgoManagerdeploy();
  console.log("NgoManager done:", ngoAddress);

    // ⏳ Small delay to let Ganache settle
  await new Promise((res) => setTimeout(res, 2000));

  const donorAddress = await DonorManagerdeploy();
  console.log("NgoManager done:", ngoAddress);

    // ⏳ Small delay to let Ganache settle
  await new Promise((res) => setTimeout(res, 2000));

  const donationAddress = await DonationManagerdeploy();
  console.log("DonationManager done:", donationAddress);

  // 📁 Save deployed addresses into JSON
  const deployed = {
    campaignAddress,
    ngoAddress,
    donorAddress,
    donationAddress,
    network: process.env.RPC_URL,
    deployer: deployerwallet.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync("./deployed.json", JSON.stringify(deployed, null, 2));
  console.log("📁 Saved deployed contract addresses to deployed.json");
};

main();
