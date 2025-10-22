import NgoApplication from "../models/NgoApplication.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import fetch from "node-fetch"; // ✅ ensure you have node-fetch installed

import { sendApplicationReceived, sendAIVerificationResult } from "../services/NgoMailService.js";

// ✅ Helper to upload buffer properly
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
    // Pipe buffer -> stream
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// ✅ Helper to forward text data to AI Agent
const sendToAiAgent = async (formData) => {
  try {
    const apiPayload = {
      campaign_title: formData.campaignTitle || "Unknown Campaign",
      campaign_details: {
        cause_of_campaign: formData.description || "Campaign description",
        location_affected: formData.location || "India",
        duration_or_timeframe: `Start date: ${formData.startDate || '2024-01-01'}, End date: ${formData.endDate || '2024-12-31'}`,
        total_fund_needed_inr: parseInt(formData.goalAmount) || 100000,
        fund_needed_breakdown: [{
          item: "Campaign Fund",
          cost_per_unit_inr: "N/A",
          quantity_needed: "N/A",
          total_cost_inr: parseInt(formData.goalAmount) || 100000
        }]
      },
      ngo_details: {
        ngo_name: formData.ngoName || "NGO Name",
        ngo_registration_id: formData.registrationNumber || "REG-12345",
        contact_email: formData.email || "ngo@example.com"
      },
      donation_impact: {
        target_beneficiaries_count: parseInt(formData.beneficiaries) || 100,
        donation_call_to_action: `Donate to support ${formData.campaignTitle || 'this campaign'}`
      },
      bank_details: {
        account_holder_name: formData.ngoName || "NGO Name",
        bank_name: formData.bankName || "State Bank of India",
        account_number: formData.accountNumber || "1234567890123456",
        ifsc_code: formData.ifscCode || "SBIN0000001",
        account_type: "Current"
      }
    };

    console.log("Sending to AI:", JSON.stringify(apiPayload, null, 2));

    const response = await fetch("https://ngo-claim-verifier.vercel.app/api/verify_claim", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API Error Response:", errorText);
      throw new Error(`AI Agent request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("AI Agent Response:", result);
    
    // Update the NGO application with the AI response
    if (result.trust_score?.final_trust_score) {
      await NgoApplication.findOneAndUpdate(
        { campaignTitle: formData.campaignTitle },
        { 
          AIApproval: result.trust_score.final_trust_score >= 70 ? "verified" : "rejected",
          aiVerificationData: result
        }
      );
    }
    
    return result;
  } catch (error) {
    console.error("Error sending to AI Agent:", error);
  }
};

// ✅ Controller
export const applyNgo = async (req, res) => {
  try {
    const formData = req.body.formData
      ? JSON.parse(req.body.formData)
      : req.body;

    if (!formData.ngoName) {
      return res.status(400).json({
        success: false,
        error: "NGO name is required",
      });
    }

    const ngoNameSanitized = formData.ngoName.replace(/\s+/g, "_");
    const baseFolder = `AidVerify/NGO/${ngoNameSanitized}`;

    const fileUploads = {};
    for (let field of Object.keys(req.files || {})) {
      if (req.files[field]?.[0]) {
        try {
          const file = req.files[field][0];
          fileUploads[field] = await uploadToCloudinary(
            file.buffer,
            baseFolder
          );
        } catch (err) {
          console.error(`Upload failed for ${field}:`, err);
          return res.status(500).json({
            success: false,
            error: `File upload failed: ${field}`,
          });
        }
      }
    }

    const newApplication = new NgoApplication({
      ...formData,
      documents: fileUploads,
    });

    await newApplication.save();

    // ✅ Send text data to AI agent after saving
    await sendToAiAgent(formData);

    //Send Confirmation Mail
    await sendApplicationReceived(formData.email, formData.ngoName, formData.campaignTitle);

    res.status(201).json({
      success: true,
      message: "Application submitted!",
      data: newApplication,
      ngoId: newApplication.ngoID
    });
  } catch (error) {
    console.error("Error in applyNgo:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


//Fetch Application with Admin Approval:PENDING
export const NgoPendingApplicationFetcher = async (req, res) => {
    try {
        const pendingApplications = await NgoApplication.find({ AdminApproval: "pending" });

        if (pendingApplications.length === 0) {
            return res.status(404).json({ message: "No pending applications found." });
        }

        // Return the array of found applications
        res.status(200).json(pendingApplications);
    } catch (error) {
        console.error("Error fetching pending NGO applications:", error);
        res.status(500).json({ message: "Could not fetch pending applications from the database." });
    }
};


//Fetch Application with Admin Approval:APPROVED
export const NgoAcceptedApplicationFetcher = async (req, res) => {
    try {
        const approvedApplications = await NgoApplication.find({ AdminApproval: "approved" });

        if (approvedApplications.length === 0) 
        {
          return res.status(404).json({ message: "No approved applications found." });
        }

        // Return the array of found applications
        res.status(200).json(approvedApplications);
    } catch (error) {
        console.error("Error fetching approved NGO applications:", error);
        res.status(500).json({ message: "Could not fetch approved applications from the database." });
    }
};

//Fetch All Applications
export const NgoAllApplicationsFetcher = async (req, res) => {
    try {
        const allApplications = await NgoApplication.find({});

        if (allApplications.length === 0) {
            return res.status(404).json({ message: "No applications found." });
        }

        // Return the array of all applications
        res.status(200).json(allApplications);
    } catch (error) {
        console.error("Error fetching all NGO applications:", error);
        res.status(500).json({ message: "Could not fetch applications from the database." });
    }
};


// ✅ Controller to set AI Agent response decision
export const setAgentResponse = async (req, res) => {
  try {
    const { trust_score, entities, bank_result, disaster_result } = req.body;

    if (!entities?.ngo_name || !trust_score?.final_trust_score) {
      return res.status(400).json({
        success: false,
        error: "Invalid AI response: required fields missing",
      });
    }

    const finalTrustScore = trust_score.final_trust_score;
    const status = finalTrustScore >= 70 ? "verified" : "rejected";

    // ✅ Find NGO campaign by ngo name
    const updatedApp = await NgoApplication.findOneAndUpdate(
      { ngoName: entities.ngo_name },
      { 
        AIApproval: status,
        aiVerificationData: {
          entities,
          bank_result,
          disaster_result,
          trust_score
        }
      },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!updatedApp) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found in DB",
      });
    }

    // Send AI verification result email
    const accepted = status === "verified";
    await sendAIVerificationResult(updatedApp.email, updatedApp.ngoName, updatedApp.campaignTitle, accepted);

    res.status(200).json({
      success: true,
      message: `AI approval set to ${status} (Trust Score: ${finalTrustScore})`,
      data: updatedApp,
    });
  } catch (error) {
    console.error("Error in setAgentResponse:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Fetch campaigns by NGO ID
export const getCampaignsByNgoId = async (req, res) => {
  try {
    const { ngoId } = req.params;
    
    // First get the NGO to get the ngoName
    const ngo = await NgoApplication.findOne({ ngoID: ngoId });
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found"
      });
    }
    
    // Find all campaigns for this NGO
    const campaigns = await NgoApplication.find({ ngoName: ngo.ngoName });
    
    res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error("Error fetching campaigns by NGO ID:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Fetch NGO by ID
export const getNgoById = async (req, res) => {
  try {
    const { ngoId } = req.params;
    
    const ngo = await NgoApplication.findOne({ ngoID: ngoId });
    
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error("Error fetching NGO by ID:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Get NGO by email
export const getNgoByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const ngo = await NgoApplication.findOne({ email });
    
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: ngo
    });
  } catch (error) {
    console.error("Error fetching NGO by email:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Process New Campaign for existing NGOs
export const processNewCampaign = async (req, res) => {
  try {
    console.log("Raw req.body:", req.body);
    console.log("req.files:", req.files);
    
    let formData = req.body || {};

    // If frontend sends JSON inside "formData" (when using FormData + files)
    if (formData.formData) {
      try {
        formData = JSON.parse(formData.formData);
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: "Invalid JSON in formData",
        });
      }
    }

    console.log("Processed formData:", formData);

    if (!formData.ngoName || !formData.campaignTitle) {
      return res.status(400).json({
        success: false,
        error: `NGO name and campaign title are required. Received: ngoName=${formData.ngoName}, campaignTitle=${formData.campaignTitle}`,
      });
    }

    // ensure NGO exists and approved
    const existingNgo = await NgoApplication.findOne({
      ngoName: formData.ngoName,
      AdminApproval: "approved",
    });

    if (!existingNgo) {
      return res.status(403).json({
        success: false,
        error: "NGO not found or not approved for new campaigns",
      });
    }

    // Upload files if any
    const campaignFolder = `AidVerify/NGO/${formData.ngoName.replace(
      /\s+/g,
      "_"
    )}/Campaigns/${formData.campaignTitle.replace(/\s+/g, "_")}`;

    const uploadedDocs = {};
    for (let field of Object.keys(req.files || {})) {
      if (req.files[field]?.[0]) {
        try {
          const file = req.files[field][0];
          uploadedDocs[field] = await uploadToCloudinary(
            file.buffer,
            campaignFolder
          );
        } catch (err) {
          console.error(`Upload failed for ${field}:`, err);
          return res
            .status(500)
            .json({ success: false, error: `Upload failed: ${field}` });
        }
      }
    }

    // create new campaign entry
    const newCampaign = new NgoApplication({
      ...formData,
      documents: uploadedDocs,
      AdminApproval: "pending",
      AIApproval: "pending",
      ngoID: existingNgo.ngoID, // Use existing NGO's ID
      registrationNumber: existingNgo.registrationNumber,
      email: existingNgo.email,
      phone: existingNgo.phone,
      contactPerson: existingNgo.contactPerson,
      designation: existingNgo.designation,
      website: existingNgo.website,
      location: existingNgo.location
    });

    await newCampaign.save();

    // send to AI for fact-check
    await sendToAiAgent(formData);

    res.status(201).json({
      success: true,
      message: "New campaign submitted successfully!",
      data: newCampaign,
    });
  } catch (error) {
    console.error("Error in processNewCampaign:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
