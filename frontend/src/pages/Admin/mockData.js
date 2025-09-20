export const mockData = {
  stats: { totalNgos: 124, totalCampaigns: 345, activeCampaigns: 82, pendingRequests: 12, totalDonations: 8542500, avgDonation: 2476 },
  donationsTrend: [
    { name: 'Jan', donations: 400000 },
    { name: 'Feb', donations: 300000 },
    { name: 'Mar', donations: 500000 },
    { name: 'Apr', donations: 450000 },
    { name: 'May', donations: 600000 },
    { name: 'Jun', donations: 800000 },
    { name: 'Jul', donations: 950000 },
    { name: 'Aug', donations: 1280000 },
  ],
  ngoApprovalRatio: [ { name: 'Approved', value: 98 }, { name: 'Pending', value: 12 }, { name: 'Rejected', value: 14 } ],
  campaignRequests: [
    { id: 'CR001', title: 'Winter Shelter for Stray Dogs', ngo: 'Paws & Claws', submitted: '2025-08-26', amount: 500000, status: 'Pending' },
    { id: 'CR002', title: 'Mid-day Meals for School Children', ngo: 'Akshaya Patra', submitted: '2025-08-25', amount: 1500000, status: 'Pending' },
  ],
  activeCampaigns: [
    { id: 'AC001', title: 'Emergency Food Supply', ngo: 'Hope Foundation', category: 'Disaster Relief', raised: 812000, goal: 1000000, status: 'Active' },
    { id: 'AC002', title: 'Digital Literacy for Children', ngo: 'Educate Future', category: 'Education', raised: 450000, goal: 750000, status: 'Active' },
    { id: 'AC003', title: 'Clean Water Project', ngo: 'AquaLife', category: 'Health', raised: 1500000, goal: 1500000, status: 'Completed' },
  ],
  ngos: [
    { id: 'NGO01', name: 'Hope Foundation', email: 'contact@hope.org', campaigns: 5, status: 'Verified' },
    { id: 'NGO02', name: 'Paws & Claws', email: 'support@paws.com', campaigns: 2, status: 'Verified' },
    { id: 'NGO03', name: 'Akshaya Patra', email: 'info@akshayapatra.org', campaigns: 0, status: 'Under Review' },
  ],
  donations: [
    { id: 'D001', donor: 'Rohan Sharma', amount: 5000, method: 'UPI', campaign: 'Emergency Food Supply', timestamp: '2025-08-27 18:30' },
    { id: 'D002', donor: 'Priya Mehta', amount: 2500, method: 'Card', campaign: 'Digital Literacy for Children', timestamp: '2025-08-27 14:15' },
    { id: 'D003', donor: 'Anonymous', amount: 10000, method: 'NetBanking', campaign: 'Clean Water Project', timestamp: '2025-08-26 20:00' },
  ],
  users: [
    { id: 'U001', name: 'Rohan Sharma', email: 'rohan@example.com', type: 'Donor', totalDonations: 25000, joined: '2025-01-15', status: 'Active' },
    { id: 'U002', name: 'Priya Mehta', email: 'priya@example.com', type: 'Donor', totalDonations: 12500, joined: '2025-03-22', status: 'Active' },
    { id: 'U003', name: 'Amit Singh', email: 'amit.fw@aidverify.ai', type: 'Field Worker', reportsSubmitted: 12, joined: '2025-02-01', status: 'Active' },
  ]
};

export const PIE_COLORS = ['#00C49F', '#FFBB28', '#FF8042'];
