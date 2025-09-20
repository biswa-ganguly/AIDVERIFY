import express from "express";
import multer from "multer";
import { applyNgo,NgoPendingApplicationFetcher,NgoAcceptedApplicationFetcher,NgoAllApplicationsFetcher,setAgentResponse,processNewCampaign,getNgoById,getCampaignsByNgoId,getNgoByEmail } from "../controllers/ngoApplicationController.js";

const router = express.Router();

// Multer setup (store in memory for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define all fields with maxCount
const uploadFields = upload.fields([
  { name: "ngoCertificate", maxCount: 1 },
  { name: "financialStatement", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "fieldImages", maxCount: 5 },   // allow multiple images
  { name: "cancelledCheque", maxCount: 1 },
]);

// Route
router.post("/apply", uploadFields, applyNgo);
router.get("/pendingApplications",NgoPendingApplicationFetcher);
router.get("/approvedApplications",NgoAcceptedApplicationFetcher);
router.get("/allApplications",NgoAllApplicationsFetcher);
router.post("/aiResponse",setAgentResponse);
router.post("/newCampaign", upload.array('images', 10), processNewCampaign);
router.get("/by-email/:email", getNgoByEmail);
router.get("/:ngoId", getNgoById);
router.get("/campaigns/:ngoId", getCampaignsByNgoId);

export default router;