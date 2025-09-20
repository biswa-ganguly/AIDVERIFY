import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { Target, Clock, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const DashboardView = ({ ngoName = "Hope Foundation", ngoData }) => {
  const { ngoId } = useParams();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalDonations: 0,
    totalDonors: 0,
    activeWorkers: 0
  });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (ngoId) {
          // Fetch campaigns by NGO ID
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/campaigns/${ngoId}`);
          const result = await response.json();
          
          if (result.success && Array.isArray(result.data)) {
            const campaignData = result.data;
            setCampaigns(campaignData);
            
            const activeCampaigns = campaignData.filter(campaign => 
              campaign.AdminApproval === 'approved' && campaign.AIApproval === 'verified'
            );
            
            setStats({
              totalCampaigns: campaignData.length,
              activeCampaigns: activeCampaigns.length,
              totalDonations: campaignData.reduce((sum, campaign) => sum + (campaign.goalAmount || 0), 0),
              totalDonors: activeCampaigns.length * 50,
              activeWorkers: 8
            });
          }
        } else {
          // Fallback to old method if no ngoId
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
          const campaigns = await response.json();
          
          if (Array.isArray(campaigns)) {
            const ngoData = campaigns.filter(campaign => campaign.ngoName === ngoName);
            setCampaigns(ngoData);
            const activeCampaigns = ngoData.filter(campaign => 
              campaign.AdminApproval === 'approved' && campaign.AIApproval === 'verified'
            );
            
            setStats({
              totalCampaigns: ngoData.length,
              activeCampaigns: activeCampaigns.length,
              totalDonations: activeCampaigns.reduce((sum, campaign) => sum + (campaign.goalAmount || 0), 0),
              totalDonors: activeCampaigns.length * 50,
              activeWorkers: 8
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [ngoId, ngoName]);

  const getStatusVariant = (adminApproval, aiApproval) => {
    if (adminApproval === 'approved' && aiApproval === 'verified') return 'default';
    if (adminApproval === 'rejected' || aiApproval === 'rejected') return 'destructive';
    return 'secondary';
  };

  const getStatusText = (adminApproval, aiApproval) => {
    if (adminApproval === 'approved' && aiApproval === 'verified') return 'Active';
    if (adminApproval === 'rejected' || aiApproval === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const getProgress = (adminApproval, aiApproval) => {
    if (adminApproval === 'approved' && aiApproval === 'verified') return Math.floor(Math.random() * 80) + 20;
    return 0;
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Welcome, {ngoName}!</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Total Campaigns" value={stats.totalCampaigns} description="All campaigns created" icon={Target} />
        <StatCard title="Active Campaigns" value={stats.activeCampaigns} description="Currently fundraising" icon={Clock} />
        <StatCard title="Total Goal Amount" value={`₹${stats.totalDonations.toLocaleString()}`} description="Across all campaigns" icon={DollarSign} />
        <StatCard title="Estimated Donors" value={stats.totalDonors} description="Total unique contributors" icon={Users} />
        <StatCard title="Active Field Workers" value={stats.activeWorkers} description="On-ground team members" icon={Users} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest fundraising campaigns and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found. Create your first campaign in the Campaign Management section.
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{campaign.campaignTitle || 'Untitled Campaign'}</h4>
                    <p className="text-sm text-muted-foreground">{campaign.description?.substring(0, 100)}...</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className={`${
                        campaign.AdminApproval === 'approved' ? 'bg-green-400 text-white hover:bg-green-600' :
                        campaign.AdminApproval === 'rejected' ? 'bg-red-400 text-white hover:bg-red-600' :
                        'bg-yellow-400 text-white hover:bg-yellow-600'
                      }`}>
                        Admin: {campaign.AdminApproval || 'pending'}
                      </Badge>
                      <Badge className={`${
                        campaign.AIApproval === 'verified' ? 'bg-green-400 text-white hover:bg-green-600' :
                        campaign.AIApproval === 'rejected' ? 'bg-red-400 text-white hover:bg-red-600' :
                        'bg-yellow-400 text-white hover:bg-yellow-600'
                      }`}>
                        AI: {campaign.AIApproval || 'pending'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Goal: ₹{(campaign.goalAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-32">
                    <Progress value={getProgress(campaign.AdminApproval, campaign.AIApproval)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{getProgress(campaign.AdminApproval, campaign.AIApproval)}% funded</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};