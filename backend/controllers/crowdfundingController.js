import Crowdfunding from '../models/Crowdfunding.js';

// Create crowdfunding project
export const createProject = async (req, res) => {
  try {
    const { title, description, targetAmount, creatorId, creatorEmail, category, endDate, milestones } = req.body;
    
    const project = new Crowdfunding({
      title,
      description,
      targetAmount,
      creatorId,
      creatorEmail,
      category,
      endDate,
      milestones: milestones || []
    });
    
    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Crowdfunding.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Crowdfunding.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Contribute to project
export const contributeToProject = async (req, res) => {
  try {
    const { projectId, userId, email, amount } = req.body;
    
    const project = await Crowdfunding.findById(projectId);
    if (!project || project.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Project not available' });
    }
    
    project.raisedAmount += amount;
    project.contributors.push({ userId, email, amount });
    
    // Check if target reached
    if (project.raisedAmount >= project.targetAmount) {
      project.status = 'completed';
    }
    
    await project.save();
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's projects
export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const projects = await Crowdfunding.find({ creatorId: userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};