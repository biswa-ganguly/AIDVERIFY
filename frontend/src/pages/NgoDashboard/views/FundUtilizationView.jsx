import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

export const FundUtilizationView = ({ ngoName, ngoData }) => {
  const { user } = useUser();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    items: '',
    receipt: null
  });
  const [ocrVerifying, setOcrVerifying] = useState(false);

  useEffect(() => {
    console.log('FundUtilizationView - ngoData:', ngoData);
    if (ngoData?.ngoID) {
      fetchReceipts(ngoData.ngoID);
    } else {
      console.log('No ngoData or ngoID, setting loading to false');
      setLoading(false);
    }
  }, [ngoData]);



  const fetchReceipts = async (ngoId) => {
    if (!ngoId) return;
    try {
      const response = await fetch(`http://localhost:3000/api/fund-utilization/ngo/${ngoId}`);
      const data = await response.json();
      if (data.success) {
        setReceipts(data.data);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyWithOCR = async () => {
    if (!formData.receipt) {
      toast.error('Please upload a receipt first.');
      return;
    }
    
    console.log('Starting OCR verification...');
    setOcrVerifying(true);
    const ocrFormData = new FormData();
    ocrFormData.append('image', formData.receipt);

    try {
      console.log('Calling OCR API:', `${import.meta.env.VITE_OCR_URL}/dev/extract-payment-data`);
      const response = await fetch(`${import.meta.env.VITE_OCR_URL}/dev/extract-payment-data`, {
        method: 'POST',
        body: ocrFormData
      });
      
      console.log('OCR Response status:', response.status);
      const ocrData = await response.json();
      console.log('OCR Data:', ocrData);
      
      const ocrAmount = parseFloat(ocrData.amount);
      const enteredAmount = parseFloat(formData.amount);
      
      console.log('Comparing amounts:', { ocrAmount, enteredAmount });
      
      if (Math.abs(ocrAmount - enteredAmount) < 1) {
        toast.success(`OCR verification successful! Receipt amount (₹${ocrAmount}) matches entered amount (₹${enteredAmount}).`, {
          action: {
            label: "Submit to Blockchain",
            onClick: () => submitToBackend()
          }
        });
      } else {
        toast.error(`OCR verification failed! Receipt amount (₹${ocrAmount}) does not match entered amount (₹${enteredAmount}). Please check and try again.`);
      }
    } catch (error) {
      console.error('OCR verification failed:', error);
      toast.error('OCR verification failed. Please try again or check your receipt image.');
    } finally {
      setOcrVerifying(false);
    }
  };

  const submitToBackend = async () => {
    if (!user?.emailAddresses?.[0]?.emailAddress || !ngoData) return;
    
    setSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append('userEmail', user.emailAddresses[0].emailAddress);
    formDataToSend.append('amount', formData.amount);
    formDataToSend.append('items', formData.items);
    formDataToSend.append('receipt', formData.receipt);

    try {
      const response = await fetch('http://localhost:3000/api/fund-utilization', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      if (data.success) {
        setFormData({ amount: '', items: '', receipt: null });
        fetchReceipts(ngoData.ngoID);
        toast.success('Receipt submitted successfully and stored on blockchain!');
      } else {
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting receipt:', error);
      toast.error('Error submitting receipt. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await verifyWithOCR();
  };



  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, receipt: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  if (loading && ngoData) {
    return <div className="text-center py-8">Loading fund utilization data...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Expense Receipt</CardTitle>
          <CardDescription>Submit a new fund usage report to be stored securely on the blockchain for transparency.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Spent (₹)</Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="e.g., 5000" 
                value={formData.amount}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="items">Items Bought</Label>
              <Input 
                id="items" 
                type="text" 
                placeholder="e.g., Rice Bags, Medical Supplies" 
                value={formData.items}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt">Upload Bill/Receipt (PDF, PNG, JPG)</Label>
              <Input 
                id="receipt" 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleChange}
                required 
              />
            </div>
            <Button className="w-full" type="submit" disabled={ocrVerifying || submitting}>
              <Eye className="mr-2 h-4 w-4" /> 
              {ocrVerifying ? 'Verifying with OCR...' : 'Verify Receipt & Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Submitted Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.items}</TableCell>
                  <TableCell>₹{r.amount}</TableCell>
                  <TableCell><Badge variant={r.status === 'Verified' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{r.txHash}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};