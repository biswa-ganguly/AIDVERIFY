import React, { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Heart, TrendingUp, FileDown, ArrowRight, CheckCircle, Search, Receipt, Download } from 'lucide-react';
import DonorNav from '../../components/DonorNav';
import FundUtilizationDashboard from '../../components/FundUtilizationDashboard';
import TokenRewards from '../../components/TokenRewards';
import { getDaysLeft } from '../../utils/getDaysLeft';
import jsPDF from 'jspdf';

gsap.registerPlugin(ScrollTrigger);

// Campaign Filters Component
const CampaignFilters = ({ searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, campaigns }) => {
  const categories = ['All', ...new Set(campaigns.map(c => c.category).filter(Boolean))];

  return (
    <div className="filter-controls flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search campaigns, NGOs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Campaign Card component
const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();
  
  const goal = campaign.goalAmount || 0;
  const raised = campaign.raisedAmount || 0;
  const percentage = goal > 0 ? Math.round((raised / goal) * 100) : 0;
  const daysLeft = getDaysLeft(campaign.endDate);
  const donors = campaign.donorCount || 0;

  return (
    <Card className="campaign-card group flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 ease-in-out border-border/60 hover:-translate-y-2 bg-card cursor-pointer" onClick={() => navigate(`/campaign/${campaign._id}`)}>
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
          <Button variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); navigate(`/campaign/${campaign._id}`); }}>View Details</Button>
          <Button className="flex-1 group/btn" onClick={(e) => { e.stopPropagation(); navigate(`/donate/${campaign._id}`); }}>Donate Now <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function DonorDashboardPage() {
  const { user, isLoaded } = useUser();
  const { donorId } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const gridRef = useRef(null);
  
  const [donorStats, setDonorStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [impactData, setImpactData] = useState({ byCategory: [], stories: [] });
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [initialAnimationsRun, setInitialAnimationsRun] = useState(false);

  // Get user's display name from Clerk
  const getDisplayName = () => {
    if (!isLoaded || !user) return 'Guest';
    
    // Priority: fullName > firstName > username > email
    if (user.fullName) return user.fullName;
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;
    if (user.primaryEmailAddress?.emailAddress) {
      // Extract name from email if available
      const emailName = user.primaryEmailAddress.emailAddress.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'Guest';
  };

  // Generate PDF receipt
  const generateReceipt = async (transaction) => {
    try {
      const campaign = allCampaigns.find(c => c._id === transaction.campaignId);
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      
      // Header background
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      // Logo and title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('AidVerify', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text('Verified Donation Platform', 20, 40);
      
      // Receipt info (right side)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('DONATION RECEIPT', pageWidth - 20, 25, { align: 'right' });
      
      pdf.setFontSize(10);
      pdf.text(`Receipt #: ${transaction.transactionId}`, pageWidth - 20, 35, { align: 'right' });
      pdf.text(`Date: ${new Date(transaction.createdAt).toLocaleDateString('en-IN')}`, pageWidth - 20, 42, { align: 'right' });
      
      let yPos = 70;
      
      // Thank you message
      pdf.setFillColor(243, 244, 246);
      pdf.rect(15, yPos, pageWidth - 30, 20, 'F');
      pdf.setTextColor(99, 102, 241);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Thank you for your generous donation!', pageWidth / 2, yPos + 12, { align: 'center' });
      
      yPos += 35;
      
      // Amount box
      pdf.setFillColor(59, 130, 246);
      pdf.rect(15, yPos, pageWidth - 30, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Rs ${transaction.amount.toLocaleString('en-IN')}`, pageWidth / 2, yPos + 12, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text('Donation Amount', pageWidth / 2, yPos + 20, { align: 'center' });
      
      yPos += 40;
      
      // Two columns
      const leftCol = 20;
      const rightCol = pageWidth / 2 + 10;
      const colWidth = (pageWidth / 2) - 25;
      
      // Donor Information
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Donor Information', leftCol, yPos);
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.rect(leftCol, yPos + 5, colWidth, 40);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Name:', leftCol + 5, yPos + 18);
      pdf.setFont(undefined, 'normal');
      const donorName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || transaction.donorName || 'N/A');
      pdf.text(donorName, leftCol + 5, yPos + 26);
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Email:', leftCol + 5, yPos + 34);
      pdf.setFont(undefined, 'normal');
      pdf.text(transaction.donorEmail, leftCol + 5, yPos + 42);
      
      // Transaction Details
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Transaction Details', rightCol, yPos);
      
      pdf.rect(rightCol, yPos + 5, colWidth, 50);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Transaction ID:', rightCol + 5, yPos + 18);
      pdf.setFont(undefined, 'normal');
      pdf.text(transaction.transactionId, rightCol + 5, yPos + 26);
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Payment Method:', rightCol + 5, yPos + 34);
      pdf.setFont(undefined, 'normal');
      pdf.text(transaction.paymentMethod || 'UPI', rightCol + 5, yPos + 42);
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Status:', rightCol + 5, yPos + 50);
      pdf.setTextColor(34, 197, 94);
      pdf.setFont(undefined, 'normal');
      pdf.text('✓ COMPLETED', rightCol + 30, yPos + 50);
      
      yPos += 70;
      
      // Campaign Information
      if (campaign) {
        pdf.setTextColor(55, 65, 81);
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Campaign Information', leftCol, yPos);
        
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(leftCol, yPos + 5, pageWidth - 40, 40);
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Campaign:', leftCol + 5, yPos + 18);
        pdf.setFont(undefined, 'normal');
        pdf.text(campaign.campaignTitle, leftCol + 5, yPos + 26);
        
        pdf.setFont(undefined, 'bold');
        pdf.text('NGO:', leftCol + 5, yPos + 34);
        pdf.setFont(undefined, 'normal');
        pdf.text(campaign.ngoName, leftCol + 5, yPos + 42);
        
        pdf.setFont(undefined, 'bold');
        pdf.text('Category:', rightCol + 5, yPos + 18);
        pdf.setFont(undefined, 'normal');
        pdf.text(campaign.category || 'General', rightCol + 5, yPos + 26);
        
        yPos += 55;
      }
      
      // Impact message
      pdf.setFillColor(254, 249, 195);
      pdf.rect(15, yPos, pageWidth - 30, 25, 'F');
      pdf.setTextColor(161, 98, 7);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Your Impact', pageWidth / 2, yPos + 10, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'normal');
      pdf.text('Your donation helps create positive change in the community.', pageWidth / 2, yPos + 18, { align: 'center' });
      
      // Footer
      yPos += 40;
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(2);
      pdf.line(20, yPos, pageWidth - 20, yPos);
      
      pdf.setTextColor(55, 65, 81);
      pdf.setFontSize(8);
      pdf.text('This is an electronically generated receipt and is valid for tax purposes.', pageWidth / 2, yPos + 10, { align: 'center' });
      pdf.text('For queries, contact: support@aidverify.com', pageWidth / 2, yPos + 18, { align: 'center' });
      
      pdf.setTextColor(59, 130, 246);
      pdf.setFont(undefined, 'bold');
      pdf.text('AidVerify - Verified Donations, Verified Impact', pageWidth / 2, yPos + 28, { align: 'center' });
      
      pdf.save(`AidVerify_Receipt_${transaction.transactionId}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  // Download fund utilization receipt
  const downloadUtilizationReceipt = async (utilizationId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/fund-utilization/receipt/${utilizationId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${utilizationId}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error downloading receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Error downloading receipt');
    }
  };

  // Fetch donor data
  useEffect(() => {
    const fetchDonorData = async () => {
      const targetDonorId = donorId || user?.id;
      if (!targetDonorId) return;
      
      try {
        setLoading(true);
        
        // Fetch donor stats
        const statsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transaction/donor-stats/${targetDonorId}`);
        const statsData = await statsResponse.json();
        
        // Fetch donor transactions
        const transactionsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transaction/donor/${targetDonorId}`);
        const transactionsData = await transactionsResponse.json();
        
        if (statsData.success) {
          setDonorStats(statsData.data);
        }
        
        if (transactionsData.success) {
          setTransactions(transactionsData.data);
          // Generate impact data from transactions
          const categoryData = {};
          transactionsData.data.forEach(txn => {
            const category = txn.category || 'General';
            categoryData[category] = (categoryData[category] || 0) + txn.amount;
          });
          
          const impactByCategory = Object.entries(categoryData).map(([category, amount]) => ({
            category,
            amount
          }));
          
          setImpactData({ byCategory: impactByCategory, stories: [] });
        }
        
        // Fetch all campaigns
        const campaignsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
        const campaignsData = await campaignsResponse.json();
        
        if (Array.isArray(campaignsData)) {
          setAllCampaigns(campaignsData);
        } else if (campaignsData.success && Array.isArray(campaignsData.data)) {
          setAllCampaigns(campaignsData.data);
        }

      } catch (err) {
        console.error('Error fetching donor data:', err);
        // Don't set error for network issues, just log them
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && (user || donorId)) {
      fetchDonorData();
    }
  }, [user, isLoaded, donorId]);

  // Filter campaigns
  const filteredAndSortedCampaigns = useMemo(() => {
    return allCampaigns
      .filter(c => {
        const isVerified = c.AdminApproval === 'approved' || c.AIApproval === 'verified';
        const categoryMatch = categoryFilter === 'All' || c.category === categoryFilter;
        const searchMatch = searchQuery === '' || 
          c.campaignTitle?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.ngoName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return isVerified && categoryMatch && searchMatch;
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [allCampaigns, categoryFilter, searchQuery]);

  // Initial animations
  useLayoutEffect(() => {
    if (initialAnimationsRun) return;
    
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-header", { autoAlpha: 0, y: -20, duration: 0.5 });
      gsap.from(".stat-card", { autoAlpha: 0, y: 20, stagger: 0.1, delay: 0.2 });
      gsap.from(".filter-controls", { 
        autoAlpha: 0, 
        y: 30, 
        duration: 0.7, 
        delay: 0.6, 
        scrollTrigger: { 
          trigger: ".filter-controls", 
          start: "top 90%" 
        } 
      });
      gsap.utils.toArray(".dashboard-section").forEach((section, i) => {
        gsap.from(section, {
          autoAlpha: 0,
          y: 30,
          duration: 0.6,
          delay: 0.5 + i * 0.2,
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
          }
        });
      });
    }, pageRef);
    
    setInitialAnimationsRun(true);
    return () => ctx.revert();
  }, [initialAnimationsRun]);

  // Animate cards when campaigns change
  useEffect(() => {
    if (!initialAnimationsRun || !gridRef.current) return;

    const cards = gsap.utils.toArray(gridRef.current.children);
    
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger && cards.includes(trigger.vars.trigger)) {
        trigger.kill();
      }
    });
    
    gsap.set(cards, { autoAlpha: 0, y: 50 });
    
    ScrollTrigger.batch(cards, {
      interval: 0.1,
      batchMax: 3,
      onEnter: batch => gsap.to(batch, { 
        autoAlpha: 1, 
        y: 0, 
        stagger: 0.15, 
        overwrite: true, 
        ease: 'power3.out' 
      }),
      onLeaveBack: batch => gsap.set(batch, { 
        autoAlpha: 0, 
        y: 50, 
        overwrite: true 
      }),
      start: "top 90%",
    });
    
    ScrollTrigger.refresh();
  }, [filteredAndSortedCampaigns, initialAnimationsRun]);

  // Cleanup ScrollTrigger on unmount
  useLayoutEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Show loading state while Clerk is loading or data is being fetched
  if (!isLoaded || loading) {
    return (
      <section>
        <DonorNav />
        <div className="bg-background">
          <div className="container max-w-screen-lg mx-auto py-8 px-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <section>
        <DonorNav />
        <div className="bg-background">
          <div className="container max-w-screen-lg mx-auto py-8 px-4">
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-red-600 mb-4">Error loading dashboard data: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <DonorNav />
      <div ref={pageRef} className="bg-background">
        <div className="container max-w-screen-lg mx-auto py-8 px-4 space-y-12">
          {/* 1. Header / Overview */}
          <header className="dashboard-header">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Hi {getDisplayName()} 👋
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back! Here's a summary of your incredible impact.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="stat-card">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Total Donated</CardTitle>
                <Wallet className="text-primary"/>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                ₹{donorStats ? donorStats.totalAmount.toLocaleString('en-IN') : '0'}
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Campaigns Supported</CardTitle>
                <Heart className="text-primary"/>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {donorStats ? donorStats.totalCampaigns : '0'}
              </CardContent>
            </Card>
            <Card className="stat-card">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Impact Summary</CardTitle>
                <TrendingUp className="text-primary"/>
              </CardHeader>
              <CardContent className="text-sm pt-2">
                {donorStats ? `Your donations helped ${donorStats.totalCampaigns} campaign${donorStats.totalCampaigns !== 1 ? 's' : ''} 🎯` : 'No donations yet'}
              </CardContent>
            </Card>
          </div>

         
          {/* 3. Donation History */}
          <section className="dashboard-section">
            <h2 className="text-2xl font-bold mb-4">Donation History</h2>
            <Card>
              {transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Campaign ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(txn => (
                      <TableRow key={txn.transactionId}>
                        <TableCell className="font-medium">{txn.transactionId}</TableCell>
                        <TableCell>{txn.campaignId}</TableCell>
                        <TableCell>{new Date(txn.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">₹{txn.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell><Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>{txn.status}</Badge></TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => generateReceipt(txn)}
                            title="Download Receipt"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No donation history found.</p>
                </CardContent>
              )}
            </Card>
          </section>

          {/* 4. Token Rewards */}
          <section className="dashboard-section">
            <TokenRewards />
          </section>

          {/* 5. Fund Utilization Receipts */}
          <section className="dashboard-section">
            <FundUtilizationDashboard />
          </section>

          {/* 6. Impact Tracker */}
          <section className="dashboard-section">
            <h2 className="text-2xl font-bold mb-4">Your Impact Tracker</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Donations by Category</CardTitle></CardHeader>
                <CardContent>
                  {impactData.byCategory && impactData.byCategory.length > 0 ? (
                    <div className="w-full h-64">
                      <ResponsiveContainer>
                        <BarChart data={impactData.byCategory} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="category" width={80} />
                          <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                          <Bar dataKey="amount" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No donation data available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Impact Stories</CardTitle></CardHeader>
                <CardContent>
                  {impactData.stories && impactData.stories.length > 0 ? (
                    impactData.stories.map((story, index) => (
                      <div key={index} className="flex items-center gap-4 mb-4 last:mb-0">
                        <img src={story.imageUrl || '/api/placeholder/96/96'} alt={story.title} className="w-24 h-24 object-cover rounded-lg"/>
                        <div>
                          <h3 className="font-semibold">{story.title}</h3>
                          <p className="text-sm text-muted-foreground">{story.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No impact stories available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}