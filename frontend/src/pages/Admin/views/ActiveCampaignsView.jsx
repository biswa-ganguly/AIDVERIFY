import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, Filter, X, Eye, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const ActiveCampaignsView = () => {
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState('');

  useEffect(() => {
    const fetchActiveCampaigns = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/approvedApplications`);
        const data = response.ok ? await response.json() : [];
        setActiveCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching active campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCampaigns();
  }, []);

  const filteredCampaigns = activeCampaigns.filter(campaign => {
    const matchesSearch = campaign.campaignTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.ngoName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || campaign.category === categoryFilter;
    const matchesLocation = !locationFilter || campaign.location === locationFilter;
    
    let matchesAmount = true;
    if (amountFilter) {
      const amount = campaign.goalAmount || 0;
      switch (amountFilter) {
        case 'under-1L': matchesAmount = amount < 100000; break;
        case '1L-5L': matchesAmount = amount >= 100000 && amount < 500000; break;
        case '5L-10L': matchesAmount = amount >= 500000 && amount < 1000000; break;
        case 'above-10L': matchesAmount = amount >= 1000000; break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesLocation && matchesAmount;
  });

  const uniqueCategories = [...new Set(activeCampaigns.map(c => c.category).filter(Boolean))];
  const uniqueLocations = [...new Set(activeCampaigns.map(c => c.location).filter(Boolean))];
  
  const clearFilters = () => {
    setCategoryFilter('');
    setLocationFilter('');
    setAmountFilter('');
    setSearchTerm('');
  };
  
  const hasActiveFilters = categoryFilter || locationFilter || amountFilter || searchTerm;

  const handleViewCampaign = (campaignId) => {
    window.open(`/campaign/${campaignId}`, '_blank');
  };

  const handleSuspendCampaign = async (campaign) => {
    if (!confirm(`Are you sure you want to suspend "${campaign.campaignTitle}"?`)) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/approval`, {
        adminapproval: "suspended",
        applicationid: campaign._id
      });
      alert(`Campaign "${campaign.campaignTitle}" has been suspended`);
      // Refresh the campaigns list
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ngo/approvedApplications`);
      const data = response.ok ? await response.json() : [];
      setActiveCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error suspending campaign:', error);
      alert('Failed to suspend campaign');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading active campaigns...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>Manage all ongoing and completed campaigns ({filteredCampaigns.length} total).</CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input 
            placeholder="Search campaigns..." 
            className="w-64" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={amountFilter} onValueChange={setAmountFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Amount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-1L">Under ₹1L</SelectItem>
              <SelectItem value="1L-5L">₹1L - ₹5L</SelectItem>
              <SelectItem value="5L-10L">₹5L - ₹10L</SelectItem>
              <SelectItem value="above-10L">Above ₹10L</SelectItem>
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2"/>Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Goal Amount</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map(campaign => (
                <TableRow key={campaign._id}>
                  <TableCell>
                    <div className="font-medium">{campaign.campaignTitle || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{campaign.ngoName || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.category || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">₹{campaign.goalAmount?.toLocaleString('en-IN') || '0'}</div>
                    <div className="text-sm text-muted-foreground">{campaign.beneficiaries || 'N/A'} beneficiaries</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {campaign.startDate} - {campaign.endDate}
                    </div>
                    <div className="text-xs text-muted-foreground">{campaign.location || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCampaign(campaign._id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Campaign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleSuspendCampaign(campaign)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No campaigns found matching your search.' : 'No active campaigns found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};