import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Receipt } from 'lucide-react';

export default function FundUtilizationDashboard() {
  const [donorEmail, setDonorEmail] = useState('diprochak@gmail.com');
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUtilizations = async () => {
    if (!donorEmail) return alert('Please enter donor email');
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/fund-utilization/donor/${donorEmail}`);
      const data = await response.json();
      
      if (data.success) {
        setUtilizations(data.data);
      } else {
        setUtilizations([]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error loading utilizations');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (utilizationId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/fund-utilization/receipt/${utilizationId}`);
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
      console.error('Error:', error);
      alert('Error downloading receipt');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Fund Utilizations Dashboard</h1>
      
      <div className="flex gap-4">
        <Input
          type="email"
          placeholder="Enter donor email"
          value={donorEmail}
          onChange={(e) => setDonorEmail(e.target.value)}
          className="flex-1"
        />
        <Button onClick={loadUtilizations} disabled={loading}>
          {loading ? 'Loading...' : 'Load Utilizations'}
        </Button>
      </div>

      {utilizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilizations.map(util => (
            <Card key={util._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">NGO: {util.ngoName}</CardTitle>
                <Badge variant={util.status === 'Verified' ? 'default' : 'secondary'}>
                  {util.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">${util.amount}</p>
                  <p className="text-sm text-gray-600"><strong>Items:</strong> {util.items}</p>
                  <p className="text-sm text-gray-500">
                    <strong>Date:</strong> {new Date(util.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <img 
                    src={util.receiptUrl} 
                    alt="Receipt" 
                    className="w-full h-48 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(util.receiptUrl, '_blank')}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadReceipt(util._id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No fund utilizations found for this donor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}