import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { gsap } from 'gsap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Lock, Users, Target, CheckCircle, Upload } from 'lucide-react';
import QRCode from 'qrcode';
import DonorNav from '../../components/DonorNav';



const PaymentSummaryCard = ({ data }) => (
  <div className="sticky top-24">
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-muted/30">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={data.ngoLogoUrl} />
            <AvatarFallback>{data.ngoName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{data.campaignTitle}</CardTitle>
            <CardDescription>by {data.ngoName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-center font-semibold text-primary">{data.emotionalAppeal}</p>
        <Progress value={(data.raised / data.goal) * 100} className="h-2" />
        <div className="text-xs text-muted-foreground">
          ₹{data.raised.toLocaleString('en-IN')} raised of ₹{data.goal.toLocaleString('en-IN')}
        </div>
        <Separator />
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
            <p className="font-bold text-green-800">Impact Highlight</p>
            <p className="text-sm text-green-700">{data.impactHighlight}</p>
        </div>
        <Separator />
         <div className="text-center space-y-2">
            <img src={data.beneficiaryImage} alt="Beneficiary" className="rounded-lg aspect-video object-cover" />
            <p className="text-sm italic text-muted-foreground px-2">{data.beneficiaryStory}</p>
            <p className="font-semibold text-foreground">You're about to change someone's life today 🙏</p>
        </div>
        <Separator />
        <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary"/> <span><span className="font-bold">{data.liveDonorCount}</span> kind donors have already contributed.</span></div>
            <div className="flex items-center gap-2"><Target className="w-4 h-4 text-primary"/> <span>Only <span className="font-bold">₹{(data.goal - data.raised).toLocaleString('en-IN')}</span> needed to reach the goal!</span></div>
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary"/> <span>100% Secure & Verified Payment</span></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function PaymentPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { user } = useUser();
  const pageRef = useRef(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [isMemorial, setIsMemorial] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Pre-fill user details from Clerk
  useEffect(() => {
    if (user) {
      console.log('User data from Clerk:', {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      });
      
      if (user.firstName || user.lastName) {
        setName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      }
      if (user.primaryEmailAddress?.emailAddress) {
        setEmail(user.primaryEmailAddress.emailAddress);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
        const campaigns = await response.json();
        
        if (Array.isArray(campaigns)) {
          const campaign = campaigns.find(c => c._id === campaignId);
          if (campaign) {
            setCampaignData({
              campaignTitle: campaign.campaignTitle || 'Untitled Campaign',
              ngoName: campaign.ngoName || 'Unknown NGO',
              ngoLogoUrl: `https://i.pravatar.cc/150?u=${campaign.ngoName}`,
              emotionalAppeal: campaign.description || 'Your support will make a difference.',
              impactHighlight: `Every ₹1,000 helps us reach our goal of ₹${campaign.goalAmount?.toLocaleString()}.`,
              raised: Math.floor((campaign.goalAmount || 0) * 0.6), // Mock 60% raised
              goal: campaign.goalAmount || 100000,
              beneficiaryImage: 'https://images.unsplash.com/photo-1541692348398-896b0a724c63?q=80&w=2070&auto=format&fit=crop',
              beneficiaryStory: campaign.story || 'Your donation will help change lives.',
              donationTiers: [
                { amount: 500, impact: 'Basic support' },
                { amount: 1000, impact: 'Significant contribution' },
                { amount: 2500, impact: 'Major impact' },
              ],
              liveDonorCount: Math.floor(Math.random() * 100) + 20,
              campaignId: campaign.campaignID
            });
          } else {
            console.error('Campaign not found');
            navigate('/home');
          }
        }
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignData();
    } else {
      navigate('/home');
    }
  }, [campaignId, navigate]);

  // Debug user authentication
  useEffect(() => {
    console.log('Current user state:', {
      isLoaded: !!user,
      userId: user?.id,
      userIdFormat: user?.id?.startsWith('user_') ? 'Clerk format' : 'Invalid format'
    });
  }, [user]);
  
  const generateQR = async () => {
    if (!amount || !name || !campaignData) return;
    
    const upiId = import.meta.env.VITE_UPI_ID;
    const upiName = import.meta.env.VITE_UPI_NAME;
    const note = `Donation for ${campaignData.campaignTitle}`;
    
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    try {
      const qr = await QRCode.toDataURL(upiUrl);
      setQrCode(qr);
      setCountdown(300);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  };
  
  const handlePaymentDone = () => {
    setShowDialog(true);
  };
  
  const uploadScreenshot = async () => {
    if (!screenshot) return;

    setIsUploading(true);
    
    try {
      // Step 1: Send to OCR service to extract and validate data (remains the same)
      const ocrFormData = new FormData();
      ocrFormData.append('image', screenshot);
      
      console.log('OCR URL:', `https://qh3t36esm8.execute-api.us-east-1.amazonaws.com/dev/extract-payment-data`);
      const ocrResponse = await fetch(`https://qh3t36esm8.execute-api.us-east-1.amazonaws.com/dev/extract-payment-data`, {
        method: 'POST',
        body: ocrFormData
      });

      if (!ocrResponse.ok) {
        throw new Error('Failed to extract data from screenshot.');
      }

      const ocrData = await ocrResponse.json();

      console.log(`Amount Set:${amount}`)
      console.log(`Amount:${ocrData.amount}`)
      console.log(`OCR Status: ${ocrData.status}`);
        
      // --- Validation and User Auth Checks (remain the same) ---
      if (String(ocrData.amount) !== String(amount)) {
        alert('❌ Payment amount mismatch or transaction not completed. Please try again.');
        setIsUploading(false);
        return;
      }

      if (!user?.id || !user.id.startsWith('user_')) {
        alert('❌ User authentication error. Please sign in again.');
        setIsUploading(false);
        return;
      }

      // Step 2 & 3 Combined: Send transaction data AND the image file to your backend
      const transactionFormData = new FormData();

      // Append all the text/data fields
      transactionFormData.append('transactionId', ocrData.transaction_id);
      transactionFormData.append('amount', parseInt(ocrData.amount));
      transactionFormData.append('campaignId', campaignData.campaignId);
      transactionFormData.append('donorId', user.id);
      transactionFormData.append('donorEmail', email);
      transactionFormData.append('donorName', name);
      transactionFormData.append('paymentMethod', ocrData.payment_method || 'UPI');
      
      // Append the actual image file itself
      transactionFormData.append('paymentProofPic', screenshot); 

      // --- log transactionFormData ---
      console.log("--- Inspecting FormData Contents ---");
      for (const pair of transactionFormData.entries()) {
        // pair[0] is the key, pair[1] is the value
        console.log(`${pair[0]}:`, pair[1]); 
      }
      
      // The single fetch call to your backend
      const transactionResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transaction`, {
        method: 'POST',
        // IMPORTANT: Do NOT set a 'Content-Type' header.
        // The browser automatically sets it to 'multipart/form-data' with the correct boundary.
        body: transactionFormData 
      });

      if (!transactionResponse.ok) {
        let errorMessage = 'Failed to save transaction.';
        try {
          const errorResult = await transactionResponse.json();
          errorMessage = errorResult.error || errorMessage;
        } catch {
          errorMessage = `Server error (${transactionResponse.status}). Please check if backend is running.`;
        }
        throw new Error(errorMessage);
      }
      
      // --- Success (remains the same) ---
      setShowDialog(false);
      setShowSuccessDialog(true);
      setTimeout(() => {
        navigate('/home');
      }, 3000);

    } catch (err) {
      console.error('Upload process failed:', err);
      alert(`❌ An error occurred: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);
  
  useLayoutEffect(() => {
    if (!campaignData || loading) return;
    
    const ctx = gsap.context(() => {
        const formSections = gsap.utils.toArray(".payment-form-section");
        const summaryCard = gsap.utils.toArray(".summary-card");
        
        if (formSections.length > 0) {
          gsap.from(formSections, { autoAlpha: 0, y: 30, stagger: 0.2, duration: 0.6, ease: 'power3.out' });
        }
        
        if (summaryCard.length > 0) {
          gsap.from(summaryCard, { autoAlpha: 0, x: 30, duration: 0.6, ease: 'power3.out' });
        }
    }, pageRef);
    return () => ctx.revert();
  }, [campaignData, loading]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <section>
        <DonorNav />
        <div className=" min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading campaign details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!campaignData) {
    return (
      <section>
        <DonorNav />
        <div className=" min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p>Campaign not found</p>
            <Button onClick={() => navigate('/home')} className="mt-4">Go Back to Home</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <DonorNav />
      <div ref={pageRef} className=" min-h-screen">
        <div className="container mx-auto py-8 md:py-12 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            
            <div className="lg:col-span-2 space-y-6">
              <Card className="payment-form-section">
                <CardHeader><CardTitle>Choose Your Donation Amount</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {campaignData.donationTiers.map(tier => (
                      <Button key={tier.amount} variant={amount === String(tier.amount) ? 'default' : 'outline'} className="h-auto py-3 flex-col" onClick={() => setAmount(String(tier.amount))}>
                        <span className="text-xl font-bold">₹{tier.amount.toLocaleString('en-IN')}</span>
                        <span className="text-xs font-normal">{tier.impact}</span>
                      </Button>
                    ))}
                  </div>
                  <Input type="number" placeholder="Enter donation amount" className="h-12 text-center" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <div className="flex items-center justify-center space-x-2 pt-2">
                      <Switch id="monthly-donation" checked={isMonthly} onCheckedChange={setIsMonthly} />
                      <Label htmlFor="monthly-donation" className="font-semibold">Make this a monthly donation</Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="payment-form-section">
                <CardHeader><CardTitle>Your Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="e.g., Biswajit Saha" value={name} onChange={(e) => setName(e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                  <div className="space-y-2 md:col-span-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                   <div className="flex items-center space-x-2 md:col-span-2 pt-2">
                      <Checkbox id="memorial-donation" checked={isMemorial} onCheckedChange={setIsMemorial} />
                      <Label htmlFor="memorial-donation">Donate in memory of someone 💙</Label>
                  </div>
                  {isMemorial && <div className="space-y-2 md:col-span-2"><Label htmlFor="memorial-name">In Memory Of</Label><Input id="memorial-name" placeholder="Name of the person" /></div>}
                </CardContent>
              </Card>

              <Card className="payment-form-section">
                <CardHeader><CardTitle>UPI Payment</CardTitle></CardHeader>
                <CardContent className="text-center space-y-4">
                  {!qrCode ? (
                    <>
                      <p className="text-muted-foreground">Enter amount and details above, then generate QR code</p>
                      <Button onClick={generateQR} disabled={!amount || !name} className="w-full">
                        Generate Payment QR Code
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <p className="font-semibold">Scan QR code with any UPI app</p>
                        <img src={qrCode} alt="Payment QR Code" className="mx-auto w-48 h-48" />
                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                          <p className="text-orange-800 font-semibold">Time remaining: {formatTime(countdown)}</p>
                          <p className="text-sm text-orange-600">Complete payment within this time</p>
                        </div>
                        <Button onClick={handlePaymentDone} className="w-full bg-green-600 hover:bg-green-700">
                          Payment Done ✓
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="payment-form-section">
                <CardContent className="pt-6">
                  <Button disabled className="w-full h-12 text-lg">
                    Complete Payment
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    This button will be enabled after payment verification
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="hidden lg:block">
              <div className="summary-card">
                <PaymentSummaryCard data={campaignData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Payment Screenshot</DialogTitle>
            <DialogDescription>
              Please upload a screenshot of your payment confirmation to verify the transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="screenshot">Payment Screenshot</Label>
              <Input 
                id="screenshot" 
                type="file" 
                accept="image/*" 
                onChange={(e) => setScreenshot(e.target.files[0])} 
              />
            </div>
            <Button onClick={uploadScreenshot} disabled={!screenshot || isUploading} className="w-full">
              {isUploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying Payment...
                </div>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Payment Proof
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-600">🎉 Payment Completed! 🎉</DialogTitle>
            <DialogDescription className="text-lg mt-4">
              🙏 Thank you for your kind donation!
              <br />
              Your generosity will make a real difference! 💖
              <br />
              Together, we're changing lives! 🌱
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button onClick={() => setShowSuccessDialog(false)} className="bg-green-600 hover:bg-green-700">
              🎆 Awesome! 🎆
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}