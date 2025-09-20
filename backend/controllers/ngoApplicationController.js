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
    const response = await fetch(process.env.AGENTIC_AI_TRIGGER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AGENTIC_AI_TRIGGER_AUTHORIZATION}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`AI Agent request failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("AI Agent Response:", result);
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
    sendToAiAgent(formData);

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
    const { trustScore, originalCampaignData } = req.body;

    if (!originalCampaignData?.campaignTitle || !trustScore) {
      return res.status(400).json({
        success: false,
        error: "Invalid AI response: campaignTitle or trustScore missing",
      });
    }

    // Convert "5%" -> 5
    const numericTrustScore = parseInt(trustScore.replace("%", "").trim(), 10);

    const status = numericTrustScore > 40 ? "verified" : "rejected";

    // ✅ Find NGO campaign by campaignTitle
    const updatedApp = await NgoApplication.findOneAndUpdate(
      { campaignTitle: originalCampaignData.campaignTitle },
      { AIApproval: status },
      { new: true }
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
      message: `AI approval set to ${status} (Trust Score: ${numericTrustScore}%)`,
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
    sendToAiAgent(formData);

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
