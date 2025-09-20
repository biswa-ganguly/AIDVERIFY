import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getDaysLeft } from '../../utils/getDaysLeft';

export default function CampaignCard({ campaign }) {
  const [campaignStats, setCampaignStats] = useState(null);
  
  useEffect(() => {
    const fetchCampaignStats = async () => {
      if (campaign.campaignID) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transaction/campaign-stats/${campaign.campaignID}`);
          const result = await response.json();
          if (result.success) {
            setCampaignStats(result.data);
          }
        } catch (error) {
          console.error('Error fetching campaign stats:', error);
        }
      }
    };
    fetchCampaignStats();
  }, [campaign.campaignID]);

  const goal = campaign.goalAmount || 0;
  const raised = campaignStats?.receivedAmount || 0;
  const percentage = campaignStats?.percentage || 0;
  const daysLeft = getDaysLeft(campaign.endDate);
  const donors = 0; // Since we don't have donor tracking yet

  return (
    <Card className="campaign-card invisible group flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 ease-in-out border-border/60 hover:-translate-y-2 bg-card">
      <div className="overflow-hidden">
        <img 
          src={campaign.documents?.fieldImages || '/api/placeholder/400/300'} 
          alt={campaign.campaignTitle || 'Campaign'} 
          className="w-full h-56 object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
        />
      </div>
      <CardContent className="flex flex-col flex-grow p-5">
        <div className="flex justify-between items-center mb-3">
          <Badge variant="secondary">{campaign.category || 'General'}</Badge>
          <CardDescription className="flex items-center gap-2 text-xs">
            {campaign.AdminApproval === 'approved' && (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="ml-1 text-green-600">Admin Approved</span>
              </div>
            )}
            {campaign.AIApproval === 'verified' && (
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-yellow-500" />
                <span className="ml-1 text-yellow-600">AI Verified</span>
              </div>
            )}
          </CardDescription>
        </div>
        <CardTitle className="text-lg font-bold leading-snug mb-2">{campaign.campaignTitle || 'Untitled Campaign'}</CardTitle>
        <p className="text-muted-foreground text-sm mb-2">by {campaign.ngoName || 'Anonymous NGO'}</p>
        <p className="text-muted-foreground text-sm mb-5 flex-grow">{campaign.description || 'No description available'}</p>
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-lg font-bold text-primary">₹{raised.toLocaleString('en-IN')}</span>
            <span className="text-sm text-muted-foreground">Goal: ₹{goal.toLocaleString('en-IN')}</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div><p className="font-bold">{daysLeft}</p><p className="text-xs text-muted-foreground">Days Left</p></div>
          <div><p className="font-bold">{donors}</p><p className="text-xs text-muted-foreground">Donors</p></div>
          <div><p className="font-bold">{percentage}%</p><p className="text-xs text-muted-foreground">Funded</p></div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30">
        <div className="flex gap-2 w-full">
          <Link to={`/campaign/${campaign._id}`} className="flex-1">
            <Button variant="outline" className="w-full">View Details</Button>
          </Link>
          <Link to={`/donate/${campaign._id}`} className="flex-1">
            <Button className="w-full group/btn">Donate Now <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" /></Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
