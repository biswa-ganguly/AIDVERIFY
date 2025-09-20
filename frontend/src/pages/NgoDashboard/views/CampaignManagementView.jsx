import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";

export const CampaignManagementView = ({ ngoName = "Hope Foundation", ngoData }) => {
  const { ngoId } = useParams();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        if (ngoId) {
          // Fetch campaigns by NGO ID
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/campaigns/${ngoId}`);
          const result = await response.json();
          
          if (result.success && Array.isArray(result.data)) {
            setCampaigns(result.data.map(campaign => ({
              id: campaign._id,
              title: campaign.campaignTitle || 'Untitled Campaign',
              status: getStatus(campaign.AdminApproval, campaign.AIApproval),
              raised: `₹${(campaign.goalAmount || 0).toLocaleString()}`,
              donors: Math.floor(Math.random() * 200) + 50,
              daysLeft: Math.floor(Math.random() * 60),
              progress: getProgress(campaign.AdminApproval, campaign.AIApproval),
              adminApproval: campaign.AdminApproval,
              aiApproval: campaign.AIApproval,
              description: campaign.description,
              startDate: campaign.startDate,
              endDate: campaign.endDate,
              beneficiaries: campaign.beneficiaries
            })));
          }
        } else {
          // Fallback to old method
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
          const allCampaigns = await response.json();
          
          if (Array.isArray(allCampaigns)) {
            const ngoData = allCampaigns.filter(campaign => campaign.ngoName === ngoName);
            setCampaigns(ngoData.map(campaign => ({
              id: campaign._id,
              title: campaign.campaignTitle || 'Untitled Campaign',
              status: getStatus(campaign.AdminApproval, campaign.AIApproval),
              raised: `₹${(campaign.goalAmount || 0).toLocaleString()}`,
              donors: Math.floor(Math.random() * 200) + 50,
              daysLeft: Math.floor(Math.random() * 60),
              progress: getProgress(campaign.AdminApproval, campaign.AIApproval),
              adminApproval: campaign.AdminApproval,
              aiApproval: campaign.AIApproval
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [ngoId, ngoName]);

  const getStatus = (adminApproval, aiApproval) => {
    if (adminApproval === 'approved' && aiApproval === 'verified') return 'Active';
    if (adminApproval === 'rejected' || aiApproval === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const getProgress = (adminApproval, aiApproval) => {
    if (adminApproval === 'approved' && aiApproval === 'verified') return Math.floor(Math.random() * 80) + 20;
    if (adminApproval === 'rejected' || aiApproval === 'rejected') return 0;
    return 0;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    beneficiaries: "",
    startDate: "",
    endDate: "",
    images: [],
  });

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, images: files }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("formData", JSON.stringify({
        campaignTitle: formData.title,
        description: formData.description,
        goalAmount: formData.goal,
        beneficiaries: formData.beneficiaries,
        startDate: formData.startDate,
        endDate: formData.endDate,
        ngoName: ngoData?.ngoName || ngoName,
      }));
      for (let i = 0; i < formData.images.length; i++) {
        fd.append("images", formData.images[i]);
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/newCampaign`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Campaign submitted successfully!");
        setFormData({
          title: "",
          description: "",
          goal: "",
          beneficiaries: "",
          startDate: "",
          endDate: "",
          images: [],
        });
        // Refresh campaigns list
        window.location.reload();
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error("Submit failed:", err);
      alert("❌ Something went wrong while submitting");
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active": return "default";
      case "Completed": return "outline";
      case "Pending": return "secondary";
      case "Rejected": return "destructive";
      default: return "secondary";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>My Campaigns</CardTitle>
          <CardDescription>View, manage, and track all your fundraising campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns found. Create your first campaign below.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Title</TableHead>
                  <TableHead>Admin Approval</TableHead>
                  <TableHead>AI Verification</TableHead>
                  <TableHead>Goal Amount</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.adminApproval === 'approved' ? 'default' : campaign.adminApproval === 'rejected' ? 'destructive' : 'secondary'}>
                        {campaign.adminApproval}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={campaign.aiApproval === 'verified' ? 'default' : campaign.aiApproval === 'rejected' ? 'destructive' : 'secondary'}>
                        {campaign.aiApproval}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.raised}</TableCell>
                    <TableCell><Progress value={campaign.progress} className="w-[60%]" /></TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm">Details</Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apply for a New Campaign</CardTitle>
          <CardDescription>Fill out the form below to submit your campaign for review.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input id="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Campaign Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleChange} required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Fundraising Goal (₹)</Label>
                <Input id="goal" type="number" value={formData.goal} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beneficiaries">Expected Beneficiaries</Label>
                <Input id="beneficiaries" type="number" value={formData.beneficiaries} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Campaign Start Date</Label>
                <Input id="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Campaign End Date</Label>
                <Input id="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Upload Images/Documents</Label>
              <Input id="images" type="file" multiple onChange={handleChange} />
            </div>
            <Button className="w-full" type="submit">Submit for Approval</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};