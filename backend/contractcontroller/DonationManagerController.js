import { ethers } from "ethers";
import DonorManager_json from "../../blockchain/build/contracts/DonorManager.json" with { type: "json" };
import DonationManager_json from "../../blockchain/build/contracts/DonationManager.json" with { type: "json" };
import deploycontractaddresses from "../deployed.json" with { type: "json" };

//const provider = new ethers.JsonRpcProvider(deploycontractaddresses.network);
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const DonorManager_abi = DonorManager_json.abi;
const DonationManager_abi = DonationManager_json.abi;

// ⏳ Utility sleep function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


// ✅ Function to register Donor with artificial mining delay
export const RegisterDonor = async (
  contractAddress,
  walletPrivateKey,
  donorUserName, // Use donorUserName as the argument
  isVerified
) => {
  const wallet = new ethers.Wallet(walletPrivateKey, provider);
  const contract = new ethers.Contract(contractAddress, DonorManager_abi, wallet);

  try {
    // 1️⃣ Call addDonor with the username and isVerified status
    const tx = await contract.addDonor(donorUserName, isVerified);
    console.log("📝 Tx hash:", tx.hash);

    // 2️⃣ Wait for at least 1 confirmation
    const receipt = await tx.wait(1);
    console.log(`✅ Donor tx mined in block ${receipt.blockNumber}`);

    // 3️⃣ Artificial delay (simulate mining wait)
    console.log("⏳ Waiting 5 seconds to simulate block mining...");
    await sleep(5000);

    // 4️⃣ Get donor details back from the blockchain using the same username
    const donorDetails = await contract.getDonorDetails(donorUserName);
    console.log("📢 Donor Details:", donorDetails);

    // Return an object with named properties for clarity
    return {
      donorId: donorDetails[0],
      donorUserName: donorDetails[1],
      isVerified: donorDetails[2],
    };
  } catch (error) {
    console.error("❌ RegisterDonor Error:", error.reason || error);
    throw error;
  }
};

// Function to get donor by username
export const getDonor = async (contractAddress, username) => {
    const contract = new ethers.Contract(contractAddress, DonorManager_abi, provider);
    
  try {
    const donorDetails = await contract.getDonorDetails(username);
    
    // Check if the donor was found by inspecting the donorId
    const donorId = donorDetails[0];
    if (donorId === '0x000000000000000000000000000000') {
      return {
        donorId: null,
        donorUserName: null,
        isVerified: false,
      };
    }

    return {
      donorId: donorDetails[0],
      donorUserName: donorDetails[1],
      isVerified: donorDetails[2],
    };
  } catch (err) {
    console.error("Error fetching donor:", err);
    throw err;
  }
};


const DonationcontractAddress = deploycontractaddresses.donationAddress;
// ✅ Function to make a donation
export const donate = async (
    walletPrivateKey,
    transactionId,
    campaignId,
    donorId,
    donorUserName,
    amount,
    proofHash
) => {
    const wallet = new ethers.Wallet(walletPrivateKey, provider);
    const contract = new ethers.Contract(DonationcontractAddress, DonationManager_abi, wallet);

    try {
        console.log("Sending donation to blockchain...");
        const tx = await contract.donate(
            transactionId,
            campaignId,
            donorId,
            donorUserName,
            amount,
            proofHash
        );
        console.log("📝 Donation Tx hash:", tx.hash);

        await tx.wait();
        console.log("✅ Donation transaction mined successfully.");
    } catch (error) {
        console.error("❌ Donation Error:", error.reason || error);
        throw error;
    }
};

// ✅ Function to get all donations by a donor's blockchain ID
export const getDonationsByDonorId = async (donorId) => {
    const contract = new ethers.Contract(DonationcontractAddress, DonationManager_abi, provider);

    try {
        const donations = await contract.getDonationsByDonorId(donorId);
        return donations;
    } catch (err) {
        console.error("❌ Error fetching donations by donor ID:", err);
        throw err;
    }
};

// ✅ Function to get all donations by a donor's username
export const getDonationsByDonorUsername = async (donorUsername) => {
    const contract = new ethers.Contract(DonationcontractAddress, DonationManager_abi, provider);

    try {
        const donations = await contract.getDonationsByDonorUsername(donorUsername);
        return donations;
    } catch (err) {
        console.error("❌ Error fetching donations by donor username:", err);
        throw err;
    }
};


//donate("0x1692040794569f9fcb4fd5da5db181d955c628b32a7727ddc07c31cc9550f170",123456,1245,0x7346D638fFb5AC67CE10fB94252FF92304dAe898,"dipro",100,"qweartsdfyuiio");