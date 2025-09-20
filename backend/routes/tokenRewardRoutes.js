import express from 'express';
import { getUserTokens, redeemTokens } from '../controllers/tokenRewardController.js';

const router = express.Router();

router.get('/user/:userId', getUserTokens);
router.post('/redeem', redeemTokens);

export default router;