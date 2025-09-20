import NgoApplication from "../models/NgoApplication.js";
import { RegisterCampaign , RegisterNgo , getNgoByEmail  } from "../contractcontroller/CampaignManagerController.js";

import { sendAdminDecision } from "../services/NgoMailService.js";
import deploycontractaddresses from "../deployed.json" with {type : "json"};

export const NGOApprovalFunction = async (req, res) => {
    try {
        const { adminapproval, walletprivatekey, applicationid } = req.body;

        const campaignManagerContractAddress=deploycontractaddresses.campaignAddress;
        const ngoManagerContractAddress=deploycontractaddresses.ngoAddress;

        if (!applicationid) return res.status(400).json({ message: "Application ID is required" });
        if (!adminapproval) return res.status(400).json({ message: "AdminApproval not provided" });

        const application = await NgoApplication.findById(applicationid);
        if (!application) return res.status(404).json({ message: "Application not found" });

        if(application.AdminApproval === "approved")
        {
            return res.status(200).json({ message:"Application is already approved. "});
        }

        if(application.AdminApproval === "rejected")
        {
            return res.status(200).json({ message:"Application is already rejected. "});
        }

        // --- Rejected ---
        if (adminapproval === "rejected") {
            const updatedApp = await NgoApplication.findByIdAndUpdate(
                applicationid,
                { AdminApproval: "rejected" },
                { new: true }
            );
            
            // Send rejection email
            await sendAdminDecision(application.email, application.ngoName, application.campaignTitle, false, application.ngoID);
            
            return res.status(200).json({ message: "Application Rejected", application: updatedApp });
        }

        // --- Approved ---
        if (adminapproval === "approved") {
            if (!walletprivatekey) {
                return res.status(400).json({ message: "Contract Address or Wallet Private Key missing" });
            }

            let ngoID = application.ngoID; // Use existing NGO ID if available

            // Check if NGO is already registered on the blockchain
            const existingNgo = await getNgoByEmail(deploycontractaddresses.ngoAddress,application.email);

            console.log("Existing NGO:", existingNgo);


            // Assuming getNgoByEmail returns a struct array where ngoId is the first element
            if (existingNgo != null && existingNgo[0] !== "0x000000000000000000000000000000") {
                console.log("Existing NGO found, skipping registration.");
                ngoID = existingNgo[0];
            } else {
                // If NGO doesn't exist, register a new one
                console.log("Registering new NGO on blockchain...");
                const newNgo = await RegisterNgo(
                    ngoManagerContractAddress,
                    walletprivatekey,
                    application.ngoName,
                    application.registrationNumber,
                    application.website,
                    application.contactPerson,
                    application.email
                );
                //console.log("NEW NGO CREATED WITH NgoID:",newNgo);
                ngoID = newNgo; // Assuming RegisterNgo returns the new NGO ID
            }

            // Register the campaign regardless of whether the NGO existed
            const campaignID = await RegisterCampaign(
                campaignManagerContractAddress,
                walletprivatekey,
                ngoID, // Use the correct NGO ID
                application.campaignTitle,
                application.description,
                application.location,
                application.goalAmount
            );

            const updatedApp = await NgoApplication.findByIdAndUpdate(
                applicationid,
                { AdminApproval: "approved", campaignID: campaignID, ngoID: ngoID },
                { new: true }
            );
            
            // Send approval email with dashboard link
            await sendAdminDecision(application.email, application.ngoName, application.campaignTitle, true, ngoID);

            return res.status(200).json({
                message: "Application Approved & Campaign Registered",
                application: updatedApp,
            });
        }

        return res.status(400).json({ message: "Invalid adminApproval value" });

    } catch (error) {
        console.error("Error in NGOApprovalFunction:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};