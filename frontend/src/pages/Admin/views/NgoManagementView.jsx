import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreHorizontal, Eye, FileCheck, Ban } from 'lucide-react';
import axios from 'axios';

export const NgoManagementView = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  useEffect(() => {
    fetchNgos();
  }, []);

  const fetchNgos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/allApplications`);
      const data = response.ok ? await response.json() : [];
      
      // Group by NGO and count campaigns
      const ngoMap = {};
      data.forEach(app => {
        const key = app.ngoName + app.email;
        if (!ngoMap[key]) {
          ngoMap[key] = {
            ...app,
            campaignCount: 0,
            campaigns: []
          };
        }
        ngoMap[key].campaignCount++;
        ngoMap[key].campaigns.push(app);
      });
      
      setNgos(Object.values(ngoMap));
    } catch (error) {
      console.error('Error fetching NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (ngo) => {
    setSelectedNgo(ngo);
    setShowProfileDialog(true);
  };

  const handleSuspend = async (ngo) => {
    if (!confirm(`Are you sure you want to suspend ${ngo.ngoName}?`)) return;
    
    try {
      // Suspend all campaigns from this NGO
      for (const campaign of ngo.campaigns) {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/approval`, {
          adminapproval: "suspended",
          applicationid: campaign._id
        });
      }
      alert(`${ngo.ngoName} has been suspended`);
      fetchNgos(); // Refresh data
    } catch (error) {
      console.error('Error suspending NGO:', error);
      alert('Failed to suspend NGO');
    }
  };

  const getStatusVariant = (ngo) => {
    const hasApproved = ngo.campaigns.some(c => c.AdminApproval === 'approved');
    const hasRejected = ngo.campaigns.some(c => c.AdminApproval === 'rejected');
    
    if (hasApproved) return 'default';
    if (hasRejected) return 'destructive';
    return 'secondary';
  };

  const getStatusText = (ngo) => {
    const hasApproved = ngo.campaigns.some(c => c.AdminApproval === 'approved');
    const hasRejected = ngo.campaigns.some(c => c.AdminApproval === 'rejected');
    
    if (hasApproved) return 'Verified';
    if (hasRejected) return 'Rejected';
    return 'Pending';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading NGOs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>NGO Management</CardTitle>
            <CardDescription>View and manage registered NGOs ({ngos.length} total).</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NGO Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Campaigns</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {ngos.length > 0 ? (
                ngos.map((ngo, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{ngo.ngoName || 'N/A'}</TableCell>
                    <TableCell>{ngo.email || 'N/A'}</TableCell>
                    <TableCell>{ngo.campaignCount}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(ngo)}>
                        {getStatusText(ngo)}
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
                          <DropdownMenuItem onClick={() => handleViewProfile(ngo)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleSuspend(ngo)}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No NGOs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* NGO Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>NGO Profile - {selectedNgo?.ngoName}</DialogTitle>
          </DialogHeader>
          
          {selectedNgo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-sm">Registration Number</p>
                  <p className="text-sm">{selectedNgo.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Website</p>
                  <p className="text-sm">{selectedNgo.website || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Contact Person</p>
                  <p className="text-sm">{selectedNgo.contactPerson || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Phone</p>
                  <p className="text-sm">{selectedNgo.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-sm mb-2">Campaigns ({selectedNgo.campaignCount})</p>
                <div className="space-y-2">
                  {selectedNgo.campaigns.map(campaign => (
                    <div key={campaign._id} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">{campaign.campaignTitle}</span>
                      <Badge variant={campaign.AdminApproval === 'approved' ? 'default' : 'secondary'}>
                        {campaign.AdminApproval || 'pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};