import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const SettingsView = ({ ngoName }) => {
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgoData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/approvedApplications`);
        const approvedNgos = await response.json();
        
        if (Array.isArray(approvedNgos)) {
          const ngo = approvedNgos.find(ngo => ngo.ngoName === ngoName);
          setNgoData(ngo);
        }
      } catch (error) {
        console.error('Error fetching NGO data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNgoData();
  }, [ngoName]);

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>NGO Profile</CardTitle>
          <CardDescription>Manage your organization's public information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>NGO Name</Label>
            <Input defaultValue={ngoData?.ngoName || ngoName} />
          </div>
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <Input defaultValue={ngoData?.registrationNumber || 'Not provided'} disabled />
          </div>
          <div className="space-y-2">
            <Label>Contact Person</Label>
            <Input defaultValue={ngoData?.contactPerson || 'Not provided'} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={ngoData?.email || 'Not provided'} />
          </div>
          <div className="space-y-2">
            <Label>Verification Status</Label>
            <p>
              <Badge variant={ngoData?.AdminApproval === 'approved' ? 'default' : 'secondary'}>
                {ngoData?.AdminApproval === 'approved' ? 'Verified' : 'Pending Verification'}
              </Badge>
            </p>
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Manage how you receive donations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bank Account Number</Label>
            <Input defaultValue={ngoData?.accountNumber ? `****${ngoData.accountNumber.slice(-4)}` : '**** **** **** 1234'} disabled />
          </div>
          <div className="space-y-2">
            <Label>IFSC Code</Label>
            <Input defaultValue={ngoData?.ifscCode || 'Not provided'} />
          </div>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input defaultValue={ngoData?.bankName || 'Not provided'} />
          </div>
          <Button>Save Payment Details</Button>
        </CardContent>
      </Card>
    </div>
  );
};