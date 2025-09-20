import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export const SettingsView = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Payment Gateway</CardTitle>
        <CardDescription>Manage your payment gateway integration.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input id="apiKey" defaultValue="pk_live_******************" />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="test-mode" />
          <Label htmlFor="test-mode">Enable Test Mode</Label>
        </div>
      </CardContent>

      <CardFooter>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>User Role Management</CardTitle>
        <CardDescription>Add or manage administrative users.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell>Admin User</TableCell>
              <TableCell>Super Admin</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Edit</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Button className="mt-4">
          <UserPlus className="w-4 h-4 mr-2"/>Add New Admin
        </Button>
      </CardContent>
    </Card>
  </div>
);
