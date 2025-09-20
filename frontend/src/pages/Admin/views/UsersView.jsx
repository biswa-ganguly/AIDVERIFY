import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { mockData } from '../mockData';

export const UsersView = () => (
  <Card>
    <CardHeader>
      <CardTitle>User Management</CardTitle>
      <CardDescription>Manage donors and field workers.</CardDescription>
    </CardHeader>

    <CardContent>
      <Tabs defaultValue="donors">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="field_workers">Field Workers</TabsTrigger>
        </TabsList>

        <TabsContent value="donors" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total Donated (INR)</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.users.filter(u=>u.type === 'Donor').map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>₹{u.totalDonations.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{u.joined}</TableCell>
                  <TableCell>
                    <Badge>{u.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="field_workers" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reports Submitted</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.users.filter(u=>u.type === 'Field Worker').map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>{u.reportsSubmitted}</TableCell>
                  <TableCell>{u.joined}</TableCell>
                  <TableCell>
                    <Badge>{u.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);
