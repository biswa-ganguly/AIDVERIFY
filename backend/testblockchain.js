import { ethers } from "ethers";
import CampaignManager_json from "../blockchain/build/contracts/CampaignManager.json" with { type: "json" };
import DonorManager from "../blockchain/build/contracts/DonorManager.json" with { type: "json" };
import NGOManager from "../blockchain/build/contracts/NgoManager.json" with { type: "json" };

import donoraddress from "./deployed.json" with { type: "json" };
import ngoaddress from "./deployed.json" with { type: "json" };

const provider = new ethers.JsonRpcProvider(donoraddress.network);

// const deployerprivatekey="0x7c3bdc172f73d725367907faec65e62b1e9a868a3644d188aea82f46978b0e8d";
// const deployerwallet=new ethers.Wallet(deployerprivatekey,provider);

// 3. ABI + Bytecode from Truffle JSON
const CampaignManager_abi = CampaignManager_json.abi;
const CampaignManager_bytecode = CampaignManager_json.bytecode;

// 4. Create ContractFactory
//const factory = new ethers.ContractFactory(CampaignManager_abi, CampaignManager_bytecode, deployerwallet);

// const deploy = async()=>{
//   try 
//   {
//     console.log("Deploying Contract...");

//     const contractDeploy = factory.deploy(); // This returns a promise
//     const contract = await contractDeploy; // Await the deployment

//     await contract.waitForDeployment(); // Wait for the transaction to be mined

//     const contractAddress = await contract.getAddress();
//     console.log("Contract deployed at address:", contractAddress);
//   } 
//   catch (error) {
//     console.log("Error:",error);
//   }
// }

// Replace with one of Ganache’s private keys
const privateKey = "0x2b919c746e67401ae5c4a34dd0131b0d129b97d26f5225309fe3caa0ec71475c"; 
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0xf852E5ed434d1399950EeB2637bA11C0D46a5A55";
//const CampaignManager_abi = CampaignManager_json.abi;

const contract = new ethers.Contract(contractAddress, CampaignManager_abi, wallet);

const blockchain = async () => {
  try {
    const tx = await contract.createCampaign(
      "Kolkata Flood",
      "Natural Disaster",
      "Kolkata,India",
      20000
    );

    console.log("Tx hash:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("📦 Transaction confirmed in block:", receipt.blockNumber);
    let campaignID;

    // Parse logs
    for (let log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        campaignID=parsedLog.args.at(0);
        console.log("📢 Event:", parsedLog.name);
        console.log("   args:", parsedLog.args);
        console.log("CampaignID:",parsedLog.args.at(0));
      } catch (err) {
        // Not all logs belong to this contract
      }
    }
  } catch (error) {
    console.log("Error:", error);
  }
};


const getCampaigns = async()=>{
  try 
  {
      const getvalues=await contract.getAllCampaignID();

      for(let campaignID of getvalues )
      {
        const campaignDetails=await contract.getCampaign(campaignID);
        //console.log("Details Of 1 Campaign:",campaignDetails);
        console.log("Amount Required:",campaignDetails[2]);
      }

      // console.log(getvalues);
  } 
  catch (error) 
  {
    console.log("Error:",error);
  }
}

// Contract ABI + address
const DonorManager_abi = DonorManager.abi;
const donorManagerAddress = donoraddress.donorAddress;  // <--- replace with Ganache deployed address

// Create contract instance
const donorManagerContract = new ethers.Contract(
  donorManagerAddress,
  NGOManager.abi,
  wallet
);

// Function to get donor by username
const getDonor = async (username) => {
  try {
    const donor = await donorManagerContract.getDonorDetails(username);

    return {
      donorId: donor[0],
      donorUserName: donor[1],
      isVerified: donor[2],
    };
  } catch (err) {
    console.error("Error fetching donor:", err);
    throw err;
  }
};


// Create contract instance
const ngomanagercontract = new ethers.Contract(
  ngoaddress.ngoAddress,
  NGOManager.abi,
  wallet
);
//Function to get NgoByEmail
export const getNgoByEmail = async (email) => {
  try {
    const ngo = await ngomanagercontract.getNgoByEmail(email);

    return ngo;
  } catch (err) {
    console.error("Error fetching ngo:", err);
    throw err;
  }
};

//blockchain();

//deploy();

//getCampaigns();

//getDonor("sukantachakraborty7637@gmail.com").then(console.log);

//getNgoByEmail("biswachatterjee63@gmail.com").then(console.log);