// src/views/CampaignRequestsView.jsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, AlertCircle } from 'lucide-react';
import { CampaignDetailsDialog } from '../components/CampaignDetailsDialog';
import axios from "axios";

export const CampaignRequestsView = () => {
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [walletAddress, setWalletAddress] = useState('');

  // 🔹 Google Sheet data with better state management
  const [sheetData, setSheetData] = useState([]);
  const [sheetLoading, setSheetLoading] = useState(true);
  const [sheetError, setSheetError] = useState(null);

  // 🔹 Add a test function to manually verify sheet data
  const testSheetAccess = async () => {
    console.log("🧪 === MANUAL SHEET TEST ===");
    const SHEET_ID = "1Fe9XFs95KFqtskWWyEhGeKSsdiJuYhzrJYhteuUzYCU";
    
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
      const response = await fetch(csvUrl);
      const text = await response.text();
      
      console.log("🔍 Raw CSV content:");
      console.log(text);
      console.log("🧪 === END TEST ===");
      
      return text;
    } catch (error) {
      console.error("🧪 Test failed:", error);
      return null;
    }
  };

  // 🔹 Expose test function to window for manual testing
  useEffect(() => {
    window.testSheetAccess = testSheetAccess;
    console.log("🧪 Test function available: Run 'testSheetAccess()' in console to debug");
  }, []);

  useEffect(() => {
    const fetchAllApplications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
        const data = response.ok ? await response.json() : [];
        setAllApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSheetData = async () => {
      setSheetLoading(true);
      setSheetError(null);
      console.log("🔍 Starting Google Sheets fetch...");
      
      const SHEET_ID = "1Fe9XFs95KFqtskWWyEhGeKSsdiJuYhzrJYhteuUzYCU";
      
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
        console.log("🔗 CSV URL:", csvUrl);
        
        const csvResponse = await fetch(csvUrl, { redirect: 'follow' });
        console.log("📡 CSV Response status:", csvResponse.status);
        
        if (csvResponse.ok) {
          const csvText = await csvResponse.text();
          console.log("📝 CSV Raw text (first 200 chars):", csvText.substring(0, 200));
          
          if (csvText && csvText.trim().length > 0 && !csvText.includes('<HTML>')) {
            const lines = csvText.split('\n').filter(line => line.trim());
            console.log("📋 Total CSV lines:", lines.length);
            
            if (lines.length > 1) {
              const parsedData = [];
              
              for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                if (!line.trim()) continue;
                
                const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
                const columns = line.split(csvRegex).map(col => {
                  return col.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
                });
                
                const campaignTitle = columns[2]?.trim();
                const status = columns[4]?.trim();
                const trustScore = columns[5]?.trim();
                const reason = columns[6]?.trim();
                const sourcesUsed = columns[7]?.trim();
                const verificationDetails = columns[11]?.trim();
                
                if (campaignTitle && campaignTitle !== '') {
                  parsedData.push({
                    title: campaignTitle,
                    verification: status || "N/A",
                    trustScore: trustScore || "N/A",
                    reason: reason || "N/A",
                    sourcesUsed: sourcesUsed || "N/A",
                    verificationDetails: verificationDetails || "N/A"
                  });
                }
              }
              
              if (parsedData.length > 0) {
                setSheetData(parsedData);
                setSheetLoading(false);
                return;
              }
            }
          }
        }
        
        throw new Error("Failed to fetch or parse CSV data");
        
      } catch (error) {
        console.error("💥 Sheet fetch error:", error);
        setSheetError(`Failed to load verification data: ${error.message}`);
        setSheetData([]);
      } finally {
        setSheetLoading(false);
      }
    };

    fetchAllApplications();
    fetchSheetData();
  }, []);

  const handleApprove = (application) => {
    setSelectedApplication(application);
    setShowApprovalDialog(true);
  };

  const handleViewDetails = (application) => {
    let sheetEntry = null;
    if (sheetData.length > 0 && application.campaignTitle) {
      sheetEntry = sheetData.find(row => 
        (row.title || "").toString().trim().toLowerCase() ===
        (application.campaignTitle || "").toString().trim().toLowerCase()
      );
    }

    const enrichedApplication = {
      ...application,
      trustScore: sheetEntry?.trustScore || "N/A",
      verification: sheetEntry?.verification || "N/A",
      verificationReason: sheetEntry?.reason || "N/A",
      verificationSources: sheetEntry?.sourcesUsed || "N/A",
      verificationDetails: sheetEntry?.verificationDetails || "N/A",
      sheetDataAvailable: sheetData.length > 0,
      sheetLoading: sheetLoading,
      sheetError: sheetError
    };

    setSelectedApplication(enrichedApplication);
    setShowDetailsDialog(true);
  };

  const handleReject = async (applicationId) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/approval`,
        { 
          adminapproval: "rejected",
          applicationid: applicationId
        }
      );
      alert(`STATUS: ${res.data.message}`);
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application. Check console for details.");
    }
  };

  const submitApproval = async () => {
    if (!walletAddress.trim()) {
      alert('Please fill in wallet address');
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/approval`,
        { 
          adminapproval: "approved",
          walletprivatekey: walletAddress,
          applicationid: selectedApplication._id,
        }
      );

      alert(`STATUS: ${res.data.message}`);
      setShowApprovalDialog(false);
      setWalletAddress('');
      setSelectedApplication(null);
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application. Check console for details.");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading campaign requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Campaign Requests</CardTitle>
            <CardDescription className="flex items-center gap-2">
              Review and approve new campaign submissions.
              {sheetLoading && (
                <span className="text-blue-600">⏳ Loading verification data...</span>
              )}
              {sheetError && (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Verification data unavailable
                </span>
              )}
              {!sheetLoading && !sheetError && sheetData.length > 0 && (
                <span className="text-green-600">✅ Verification data loaded ({sheetData.length} records)</span>
              )}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Title</TableHead>
                <TableHead>NGO Name</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Amount (INR)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {allApplications.map(application => (
                <TableRow key={application._id}>
                  <TableCell className="font-medium">{application.campaignTitle || 'N/A'}</TableCell>
                  <TableCell>{application.ngoName || 'N/A'}</TableCell>
                  <TableCell>{application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>₹{application.goalAmount?.toLocaleString('en-IN') || '0'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={
                        application.AdminApproval === 'approved' 
                          ? 'bg-green-100 text-green-900' 
                          : application.AdminApproval === 'rejected' 
                          ? 'bg-red-100 text-red-900' 
                          : 'bg-yellow-100 text-yellow-900'
                      }
                    >
                      {application.AdminApproval || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                          View Details & Docs
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {application.AdminApproval === 'approved' ? (
                          <>
                            <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                            <DropdownMenuItem>Request Modification</DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => handleApprove(application)}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleReject(application._id)}
                            >
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem>Request Modification</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className='space-y-2'>
              <Label htmlFor="walletAddress">Wallet Address *</Label>
              <Input
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={submitApproval} className="flex-1">
                Approve Campaign
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowApprovalDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog with Trust/Verification */}
      <CampaignDetailsDialog 
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        application={selectedApplication}
      />
    </>
  );
};