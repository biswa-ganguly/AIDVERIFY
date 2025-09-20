import TokenReward from '../models/TokenReward.js';

// Award tokens for donation
export const awardTokens = async (userId, email, donationAmount, campaignId) => {
  try {
    const tokensEarned = Math.floor(donationAmount / 100); // 1 token per ₹100
    
    let userTokens = await TokenReward.findOne({ userId });
    
    if (!userTokens) {
      userTokens = new TokenReward({ userId, email });
    }
    
    userTokens.totalTokens += tokensEarned;
    userTokens.earnedTokens += tokensEarned;
    userTokens.transactions.push({
      type: 'earned',
      amount: tokensEarned,
      reason: 'Donation reward',
      campaignId
    });
    
    await userTokens.save();
    return tokensEarned;
  } catch (error) {
    console.error('Error awarding tokens:', error);
    return 0;
  }
};

// Get user tokens
export const getUserTokens = async (req, res) => {
  try {
    const { userId } = req.params;
    const userTokens = await TokenReward.findOne({ userId });
    
    res.json({
      success: true,
      data: userTokens || { totalTokens: 0, earnedTokens: 0, redeemedTokens: 0, transactions: [] }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Redeem tokens
export const redeemTokens = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    
    const userTokens = await TokenReward.findOne({ userId });
    if (!userTokens || userTokens.totalTokens < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient tokens' });
    }
    
    userTokens.totalTokens -= amount;
    userTokens.redeemedTokens += amount;
    userTokens.transactions.push({
      type: 'redeemed',
      amount,
      reason
    });
    
    await userTokens.save();
    res.json({ success: true, message: 'Tokens redeemed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};