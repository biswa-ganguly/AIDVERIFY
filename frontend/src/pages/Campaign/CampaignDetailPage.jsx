import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import {
  CheckCircle,
  Users,
  Target,
  Calendar,
  MapPin,
  Share2,
  Heart,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Link, useParams } from 'react-router-dom';
import DonorNav from '../../components/DonorNav';



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- SUB-COMPONENTS ---

const DonationPanel = ({ campaign }) => {
  const [amount, setAmount] = useState('1000');
  const [donationType, setDonationType] = useState('one-time');

  return (
    <div className="sticky top-24">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Make a Donation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ToggleGroup
            type="single"
            value={amount}
            onValueChange={(value) => { if (value) setAmount(value); }}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem value="500" className="py-6 text-md">₹500</ToggleGroupItem>
            <ToggleGroupItem value="1000" className="py-6 text-md">₹1,000</ToggleGroupItem>
            <ToggleGroupItem value="2500" className="py-6 text-md">₹2,500</ToggleGroupItem>
            <ToggleGroupItem value="5000" className="py-6 text-md">₹5,000</ToggleGroupItem>
          </ToggleGroup>
          <Input 
            type="number" 
            placeholder="Or enter a custom amount" 
            className="h-12 text-center text-lg"
            onChange={(e) => setAmount(e.target.value)}
          />
          <ToggleGroup
            type="single"
            defaultValue="one-time"
            value={donationType}
            onValueChange={(value) => { if (value) setDonationType(value); }}
            className="w-full"
          >
            <ToggleGroupItem value="one-time" className="w-1/2">One-time</ToggleGroupItem>
            <ToggleGroupItem value="monthly" className="w-1/2">Monthly</ToggleGroupItem>
          </ToggleGroup>
          <Link to={`/donate/${campaign._id}`}>
          <Button size="lg" className="w-full text-lg">
            Proceed to Donate ₹{amount}
          </Button>
          </Link>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={campaign.ngoInfo.logoUrl} alt={campaign.ngoInfo.name}/>
            <AvatarFallback>{campaign.ngoInfo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-md">{campaign.ngoInfo.name}</CardTitle>
            <p className="text-xs text-muted-foreground">Estd. {campaign.ngoInfo.established}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{campaign.ngoInfo.mission}</p>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2"/> Share this Campaign
        </Button>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

export default function CampaignDetailPage() {
  const { id } = useParams();
  const pageRef = useRef(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaignStats, setCampaignStats] = useState(null);
  
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
        const campaigns = response.ok ? await response.json() : [];
        const foundCampaign = campaigns.find(c => c._id === id);
        
        if (foundCampaign) {
          // Use campaignID if available, otherwise fall back to _id
          const campaignIdentifier = foundCampaign.campaignID || foundCampaign._id;
          
          // Fetch campaign stats (raised amount, donors count)
          let stats = null;
          let uniqueDonors = 0;
          
          try {
            const statsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transaction/campaign-stats/${campaignIdentifier}`);
            stats = statsResponse.ok ? await statsResponse.json() : null;
            console.log('Campaign stats:', stats);
          } catch (error) {
            console.error('Error fetching campaign stats:', error);
          }
          
          try {
            const transactionsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transaction/campaign/${campaignIdentifier}`);
            const transactionsData = transactionsResponse.ok ? await transactionsResponse.json() : null;
            console.log('Campaign transactions:', transactionsData);
            uniqueDonors = transactionsData?.success ? new Set(transactionsData.data.map(t => t.donorId)).size : 0;
          } catch (error) {
            console.error('Error fetching campaign transactions:', error);
          }
          
          // Transform database data to match component expectations
          const transformedCampaign = {
            ...foundCampaign,
            title: foundCampaign.campaignTitle,
            ngo: foundCampaign.ngoName,
            imageUrl: foundCampaign.documents?.fieldImages || '/api/placeholder/800/400',
            raised: stats?.success ? stats.data.receivedAmount || 0 : 0,
            goal: foundCampaign.goalAmount || 0,
            donors: uniqueDonors,
            fullDescription: foundCampaign.description || 'No description available',
            ngoInfo: {
              name: foundCampaign.ngoName,
              logoUrl: '/api/placeholder/150/150',
              established: 'N/A',
              mission: 'Dedicated to making a positive impact in the community.'
            },
            fundBreakdown: [
              { name: 'Program Implementation', value: 70 },
              { name: 'Operations', value: 20 },
              { name: 'Admin Costs', value: 10 }
            ],
            verificationSummary: 'Campaign verified through our comprehensive review process.',
            updates: [],
            recentDonors: []
          };
          setCampaign(transformedCampaign);
          setCampaignStats(stats?.success ? stats.data : null);
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCampaign();
    }
  }, [id]);
  
  const percentage = campaign?.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
  
  useLayoutEffect(() => {
    if (campaign) {
      const ctx = gsap.context(() => {
        gsap.from(".campaign-header", { autoAlpha: 0, y: -30, duration: 0.7, ease: 'power3.out' });
        gsap.from(".campaign-stats .stat-item", { autoAlpha: 0, y: 20, stagger: 0.15, delay: 0.3 });
        gsap.from(".main-content", { autoAlpha: 0, y: 30, duration: 0.7, delay: 0.5 });
        gsap.from(".donation-panel", { autoAlpha: 0, x: 30, duration: 0.7, delay: 0.5 });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [campaign]);
  
  if (loading) {
    return (
      <div>
        <DonorNav />
        <div className="container max-w-screen-xl mx-auto py-10 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div>
        <DonorNav />
        <div className="container max-w-screen-xl mx-auto py-10 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Campaign Not Found</h1>
            <p className="text-muted-foreground mt-2">The campaign you're looking for doesn't exist.</p>
            <Link to="/" className="mt-4 inline-block">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }


  return (
    <section>
      <DonorNav />
    <div ref={pageRef} className="bg-muted/20 font-sans antialiased">
      <div className="container max-w-screen-xl mx-auto py-10 px-4">
        {/* --- Campaign Overview --- */}
        <header className="campaign-header mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{campaign.title}</h1>
          <div className="flex items-center gap-2 text-md text-muted-foreground mb-4">
            <span>by {campaign.ngo}</span>
            <div className="flex gap-2">
              {campaign.AdminApproval === 'approved' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" /> Admin Verified
                </Badge>
              )}
              {campaign.AIApproval === 'verified' && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <CheckCircle className="w-3 h-3 mr-1" /> AI Verified
                </Badge>
              )}
            </div>
          </div>
          <Card className="overflow-hidden">
            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-[400px] object-cover" />
          </Card>
        </header>

        {/* --- Main Layout: Details (Left) & Donation (Right) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-2 main-content">
            <Card className="mb-6 campaign-stats">
              <CardContent className="p-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold text-primary">₹{campaign.raised.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-muted-foreground">Goal: ₹{campaign.goal.toLocaleString('en-IN')}</span>
                </div>
                <Progress value={percentage} className="h-3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                  <div className="stat-item"><p className="font-bold text-xl">{percentage}%</p><p className="text-xs text-muted-foreground">Funded</p></div>
                  <div className="stat-item"><p className="font-bold text-xl">{campaign.donors}</p><p className="text-xs text-muted-foreground">Donors</p></div>
                  <div className="stat-item"><p className="font-bold text-xl">{Math.round((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24))}</p><p className="text-xs text-muted-foreground">Days Left</p></div>
                   <div className="stat-item flex items-center justify-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground"/> <p className="font-semibold">{campaign.location}</p></div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Campaign Details</TabsTrigger>
                <TabsTrigger value="transparency">Transparency</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="p-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: campaign.fullDescription }} />
                </Card>
              </TabsContent>
              
              <TabsContent value="transparency" className="mt-6">
                <Card>
                    <CardHeader><CardTitle>Breakdown of Fund Usage</CardTitle></CardHeader>
                    <CardContent>
                        <div className="w-full h-80">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={campaign.fundBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {campaign.fundBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <Separator className="my-6" />
                        <h3 className="font-semibold mb-2">AidVerifyAI Verification Report</h3>
                        <p className="text-sm text-muted-foreground">{campaign.verificationSummary}</p>
                    </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates" className="mt-6 space-y-4">
                 {campaign.updates.map((update, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <p className="text-xs text-muted-foreground mb-1">{new Date(update.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <h4 className="font-semibold mb-2">{update.title}</h4>
                            <p className="text-sm">{update.description}</p>
                        </CardContent>
                    </Card>
                 ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-1 donation-panel mt-8 lg:mt-0">
            <DonationPanel campaign={campaign} />
          </div>
        </div>
      </div>
    </div>
    </section>
  );
}