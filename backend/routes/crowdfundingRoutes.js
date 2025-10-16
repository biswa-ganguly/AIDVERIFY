import express from 'express';
import { createProject, getAllProjects, getProjectById, contributeToProject, getUserProjects } from '../controllers/crowdfundingController.js';

const router = express.Router();

router.post('/create', createProject);
router.get('/all', getAllProjects);
router.get('/:id', getProjectById);
router.post('/contribute', contributeToProject);
router.get('/user/:userId', getUserProjects);

export default router;