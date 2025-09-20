import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { mockData } from '../mockData';

export const DonationsView = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Donations</CardTitle>
        <CardDescription>Browse and export all transactions.</CardDescription>
      </div>
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2"/>Export CSV
      </Button>
    </CardHeader>

    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Amount (INR)</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {mockData.donations.map(d => (
            <TableRow key={d.id}>
              <TableCell className="font-medium">{d.donor}</TableCell>
              <TableCell>₹{d.amount.toLocaleString('en-IN')}</TableCell>
              <TableCell>{d.method}</TableCell>
              <TableCell>{d.campaign}</TableCell>
              <TableCell>{d.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);
