import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const AIResponseView = () => {
  const [aiResponses, setAiResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIResponses();
  }, []);

  const fetchAIResponses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/ai-responses`);
      const data = await response.json();
      if (data.success) {
        setAiResponses(data.data);
      }
    } catch (error) {
      console.error('Error fetching AI responses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading AI responses...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Verification Responses</h1>
        <p className="text-muted-foreground">View AI verification results for NGO campaigns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Verification Results</CardTitle>
          <CardDescription>Automated verification responses from the AI system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NGO Name</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Trust Score</TableHead>
                <TableHead>Bank Verified</TableHead>
                <TableHead>Disaster Verified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aiResponses.map((response, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{response.ngoName}</TableCell>
                  <TableCell>{response.campaignTitle}</TableCell>
                  <TableCell>
                    <Badge variant={response.trustScore >= 70 ? "default" : "destructive"}>
                      {response.trustScore}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={response.bankVerified ? "default" : "secondary"}>
                      {response.bankVerified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={response.disasterVerified ? "default" : "secondary"}>
                      {response.disasterVerified ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={response.aiApproval === "verified" ? "default" : "destructive"}>
                      {response.aiApproval}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(response.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};