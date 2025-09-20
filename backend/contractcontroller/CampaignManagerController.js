import { ethers } from "ethers";
import CampaignManager_json from "../../blockchain/build/contracts/CampaignManager.json" with { type: "json" };
import NGOManager from "../../blockchain/build/contracts/NgoManager.json" with { type: "json" };
import deploycontractaddresses from "../deployed.json" with { type: "json" };

const provider = new ethers.JsonRpcProvider(deploycontractaddresses.network);
const CampaignManager_abi = CampaignManager_json.abi;
const NgoManager_abi=NGOManager.abi;


export const RegisterCampaign = async (
    contractAddress,
    walletPrivatekey,
    ngoID,
    Camp_Name,
    Camp_desc,
    Camp_loc,
    camp_targetAmount
) => {
    const wallet = new ethers.Wallet(walletPrivatekey, provider);
    const contract = new ethers.Contract(contractAddress, CampaignManager_abi, wallet);
    let campaignID;

    try {
        const tx = await contract.createCampaign(ngoID, Camp_Name, Camp_desc, Camp_loc, camp_targetAmount);
        console.log("Tx hash:", tx.hash);

        const receipt = await tx.wait();

        // Filter only logs from this contract
        const contractLogs = receipt.logs.filter(log => log.address.toLowerCase() === contractAddress.toLowerCase());

        for (let log of contractLogs) {
            try {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog.name === "CampaignCreated") {
                    campaignID = parsedLog.args[0]; // safer than .at(0)
                    console.log("📢 Event:", parsedLog.name, "CampaignID:", campaignID);
                }
            } catch (err) {
                console.log("Log parsing error:", err);
            }
        }
    } catch (error) {
        console.error("RegisterCampaign Error:", error);
        throw error;
    }

    return campaignID;
};


// Function to register NGO
export const RegisterNgo = async (
    contractAddress,
    walletPrivateKey,
    NgoName,
    regNo,
    website,
    contactPerson,
    contactEmail,
) => {
    const wallet = new ethers.Wallet(walletPrivateKey, provider);
    const contract = new ethers.Contract(contractAddress, NgoManager_abi, wallet);
    let ngoID;

    try {
        // 1️⃣ Send transaction
        const tx = await contract.registerNgo(
            NgoName,
            regNo,
            website,
            contactPerson,
            contactEmail
        );
        console.log("Tx hash:", tx.hash);

        // 2️⃣ Wait for confirmation
        const receipt = await tx.wait();

        // 3️⃣ Filter only logs from this contract
        const contractLogs = receipt.logs.filter(
            (log) => log.address.toLowerCase() === contractAddress.toLowerCase()
        );

        for (let log of contractLogs) {
            try {
                const parsedLog = contract.interface.parseLog(log);
                if (parsedLog.name === "NgoRegistered") {
                    ngoID = parsedLog.args.ngoId; // get ngoId from event
                    console.log("📢 Event:", parsedLog.name, "NgoID:", ngoID);
                }
            } catch (err) {
                console.log("Log parsing error:", err);
            }
        }
    } catch (error) {
        console.error("RegisterNgo Error:", error);
        throw error;
    }

    return ngoID;
};

// Function to get NgoByEmail
export const getNgoByEmail = async (contractAddress, email) => {
    try {
        if (!email) {
            throw new Error("Email parameter cannot be empty.");
        }

        const ngoManagerContract = new ethers.Contract(
            contractAddress,
            NgoManager_abi, // Your ABI
            provider
        );

        // Call the new "no-revert" function
        const [found, ngo] = await ngoManagerContract.findNgoByEmail(email);

        // Check the boolean flag instead of catching an error
        if (!found) {
            console.log("NGO NOT FOUND WITH THIS EMAIL");
            return null; // A clear, intentional "not found" return
        }

        console.log("NGO FOUND:", ngo);
        return ngo;

    } catch (err) {
        // This catch block now only handles REAL errors, like network issues
        // or if the contract itself has a bug.
        console.error("An unexpected error occurred while fetching NGO:", err);
        throw err;
    }
};
