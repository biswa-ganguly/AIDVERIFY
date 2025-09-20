import { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '../components/StatCard';
import { Building, FileCheck, DollarSign, Target } from 'lucide-react';

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const DashboardView = () => {
  const [stats, setStats] = useState({
    totalNgos: 0,
    pendingRequests: 0,
    totalDonations: 0,
    activeCampaigns: 0
  });
  const [approvalRatio, setApprovalRatio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
      const applications = response.ok ? await response.json() : [];
      
      // Calculate stats
      const uniqueNgos = new Set(applications.map(app => app.ngoName + app.email)).size;
      const pendingCount = applications.filter(app => app.AdminApproval === 'pending').length;
      const approvedCount = applications.filter(app => app.AdminApproval === 'approved').length;
      const rejectedCount = applications.filter(app => app.AdminApproval === 'rejected').length;
      const totalDonations = applications.reduce((sum, app) => sum + (app.goalAmount || 0), 0);

      setStats({
        totalNgos: uniqueNgos,
        pendingRequests: pendingCount,
        totalDonations: totalDonations,
        activeCampaigns: approvedCount
      });

      setApprovalRatio([
        { name: 'Approved', value: approvedCount },
        { name: 'Pending', value: pendingCount },
        { name: 'Rejected', value: rejectedCount }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock donations trend data (since we don't have actual donation tracking yet)
  const donationsTrend = [
    { name: 'Jan', donations: 400000 },
    { name: 'Feb', donations: 300000 },
    { name: 'Mar', donations: 500000 },
    { name: 'Apr', donations: 280000 },
    { name: 'May', donations: 590000 },
    { name: 'Jun', donations: 320000 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total NGOs" value={stats.totalNgos} icon={Building} />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={FileCheck} />
        <StatCard title="Total Goal Amount (INR)" value={`₹${stats.totalDonations.toLocaleString('en-IN')}`} icon={DollarSign} />
        <StatCard title="Active Campaigns" value={stats.activeCampaigns} icon={Target} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Donations Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={donationsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="donations" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Campaign Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip />
                <Pie
                  data={approvalRatio}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {approvalRatio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};