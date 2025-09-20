const API_BASE_URL = 'http://localhost:3000/api';

// Mock campaigns data (since no campaign API exists yet)
const mockCampaigns = [
  { id: 1, title: 'Emergency Food Supply for Flood Victims', ngo: 'Hope Foundation', category: 'Disaster Relief', description: 'Providing essential food kits to 1,000 families affected by the recent monsoon floods in West Bengal.', raised: 8120, goal: 10000, donors: 152, endDate: '2025-09-30', imageUrl: 'https://images.unsplash.com/photo-1547923391-8c491a6d4416?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, title: 'Digital Literacy for Rural Children', ngo: 'Educate Future', category: 'Education', description: 'Equipping 5 village schools with computers and internet access to bridge the digital divide.', raised: 4500, goal: 7500, donors: 88, endDate: '2025-10-15', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop' },
  { id: 3, title: 'Clean Water & Sanitation Project', ngo: 'AquaLife', category: 'Health', description: 'Building wells and sanitation facilities to provide clean drinking water for a community of 5,000 people.', raised: 12350, goal: 15000, donors: 230, endDate: '2025-11-01', imageUrl: 'https://images.unsplash.com/photo-1598548386344-23b8e420c115?q=80&w=2070&auto=format&fit=crop' },
  { id: 4, title: 'Animal Shelter Support Fund', ngo: 'Paws & Claws', category: 'Animals', description: 'Providing food, shelter, and medical care for stray and abandoned animals in the city.', raised: 4100, goal: 5000, donors: 65, endDate: '2025-09-25', imageUrl: 'https://images.unsplash.com/photo-1598875184988-5e67b1a8e7b0?q=80&w=2070&auto=format&fit=crop' },
  { id: 5, title: 'Mobile Health Clinic for Remote Areas', ngo: 'HealthReach', category: 'Health', description: 'Operating a mobile clinic to provide essential medical services to underserved communities in remote regions.', raised: 18500, goal: 25000, donors: 310, endDate: '2025-11-20', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba9996a?q=80&w=2070&auto=format&fit=crop' },
  { id: 6, title: 'Reforestation Drive in the Aravalli Range', ngo: 'Green Planet', category: 'Environment', description: 'Planting 10,000 native trees to restore the ecosystem and combat desertification.', raised: 9500, goal: 12000, donors: 180, endDate: '2025-10-05', imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop' },
];

export const fetchDonorStats = async (donorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transaction/donor-stats/${donorId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching donor stats:', error);
    throw error;
  }
};

export const fetchDonorTransactions = async (donorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transaction/donor/${donorId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching donor transactions:', error);
    throw error;
  }
};

export const getActiveDonations = (transactions) => {
  // Get unique campaign IDs from transactions
  const campaignIds = [...new Set(transactions.map(t => t.campaignId))];
  
  // Filter campaigns that the donor has contributed to
  return mockCampaigns.filter(campaign => campaignIds.includes(campaign.id.toString()));
};

export const getRecommendedCampaigns = (transactions) => {
  // Get campaign IDs the donor has already contributed to
  const donatedCampaignIds = [...new Set(transactions.map(t => t.campaignId))];
  
  // Return campaigns the donor hasn't contributed to yet
  return mockCampaigns.filter(campaign => !donatedCampaignIds.includes(campaign.id.toString())).slice(0, 4);
};

export const getAllCampaigns = () => {
  return mockCampaigns;
};