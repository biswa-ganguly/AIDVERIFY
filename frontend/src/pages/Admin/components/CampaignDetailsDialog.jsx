import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, FileText, Shield, TrendingUp } from 'lucide-react';

export const CampaignDetailsDialog = ({ open, onClose, application }) => {
  if (!application) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustScoreColor = (score) => {
    const numScore = parseInt(score?.replace('%', '') || '0');
    if (numScore >= 70) return 'text-green-600';
    if (numScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Campaign Review - {application.campaignTitle}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="campaign" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaign">Campaign Details</TabsTrigger>
            <TabsTrigger value="verification">AI Verification</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <div className="max-h-[70vh] overflow-y-auto mt-4">
            {/* Campaign Details Tab */}
            <TabsContent value="campaign" className="space-y-4">
              {/* Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Application Status</span>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(application.AdminApproval)}>
                        Admin: {application.AdminApproval || 'Pending'}
                      </Badge>
                      <Badge className={getStatusColor(application.AIApproval)}>
                        AI: {application.AIApproval || 'Pending'}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Campaign Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Campaign Title</p>
                      <p className="font-medium">{application.campaignTitle || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Tagline</p>
                      <p className="text-sm">{application.tagline || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Category</p>
                      <Badge variant="outline">{application.category || 'N/A'}</Badge>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Location</p>
                      <p className="text-sm">{application.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Duration</p>
                      <p className="text-sm">{application.startDate} - {application.endDate}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Goal Amount</p>
                      <p className="font-bold text-lg text-green-600">₹{application.goalAmount?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Beneficiaries</p>
                      <p className="text-sm">{application.beneficiaries || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Campaign ID</p>
                      <p className="text-sm font-mono">{application.campaignID || 'Not assigned'}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{application.description || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Story</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{application.story || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Expected Outcomes</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">{application.outcomes || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NGO Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">NGO Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-600">NGO Name</p>
                      <p className="font-medium">{application.ngoName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Registration Number</p>
                      <p className="text-sm font-mono">{application.registrationNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Website</p>
                      {application.website ? (
                        <a href={application.website} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                          {application.website} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : 'N/A'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Contact Person</p>
                      <p className="text-sm">{application.contactPerson || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Designation</p>
                      <p className="text-sm">{application.designation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Email</p>
                      <p className="text-sm">{application.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Phone</p>
                      <p className="text-sm">{application.phone || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Banking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Account Number</p>
                      <p className="text-sm font-mono">{application.accountNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">IFSC Code</p>
                      <p className="text-sm font-mono">{application.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-600">Bank Name</p>
                      <p className="text-sm">{application.bankName || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Verification Tab */}
            <TabsContent value="verification" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    AI Verification Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-semibold text-sm text-gray-600">Trust Score</p>
                      <p className={`text-2xl font-bold ${getTrustScoreColor(application.trustScore)}`}>
                        {application.trustScore || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="font-semibold text-sm text-gray-600">Verification Status</p>
                      <Badge className={getStatusColor(application.verification?.includes('True') ? 'approved' : 'rejected')}>
                        {application.verification || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Verification Status</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {application.verification || 'No verification data available'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Verification Reason</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {application.verificationReason || 'No reason provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Sources Used</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {application.verificationSources || 'No sources listed'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="font-semibold text-sm text-gray-600 mb-2">Detailed Verification Report</p>
                      <p className="text-sm bg-gray-50 p-3 rounded">
                        {application.verificationDetails || 'No detailed report available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> AI verification is based on external data sources and fact-checking. 
                      Trust scores above 70% are generally considered reliable.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.documents ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(application.documents).map(([key, url]) => {
                        if (!url) return null;
                        const docNames = {
                          ngoCertificate: 'NGO Certificate',
                          financialStatement: 'Financial Statement',
                          idProof: 'ID Proof',
                          fieldImages: 'Field Images',
                          cancelledCheque: 'Cancelled Cheque'
                        };
                        return (
                          <div key={key} className="p-3 border rounded-lg">
                            <p className="font-semibold text-sm mb-2">{docNames[key] || key}</p>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" />
                              View Document
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No documents uploaded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};