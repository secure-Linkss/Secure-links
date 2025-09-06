import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Link,
  MousePointer,
  Eye,
  Calendar,
  Settings
} from 'lucide-react';

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [expandedCampaigns, setExpandedCampaigns] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCampaigns = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (activeTab === 'my') {
        // For "My Campaigns", we'll need to get current user ID
        // For now, we'll use a placeholder
        params.append('owner_id', '1');
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/campaigns?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const data = await response.json();
      
      if (data.id) {
        // Update campaign with detailed links data
        setCampaigns(prev => prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, links: data.links }
            : campaign
        ));
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab, statusFilter]);

  const toggleCampaignExpansion = async (campaignId) => {
    const newExpanded = new Set(expandedCampaigns);
    
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
      // Fetch campaign details when expanding
      await fetchCampaignDetails(campaignId);
    }
    
    setExpandedCampaigns(newExpanded);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'default', className: 'bg-green-100 text-green-800' },
      paused: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      completed: { variant: 'outline', className: 'bg-blue-100 text-blue-800' },
      draft: { variant: 'outline', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Draft'}
      </Badge>
    );
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.owner?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all marketing campaigns
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            All Campaigns
          </Button>
          <Button 
            variant={activeTab === 'my' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('my')}
          >
            My Campaigns
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading campaigns...</div>
        ) : filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No campaigns found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCampaignExpansion(campaign.id)}
                      className="p-1"
                    >
                      {expandedCampaigns.has(campaign.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Owner: {campaign.owner?.username || 'Unknown'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Created: {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(campaign.status)}
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Campaign Stats */}
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-lg font-semibold">{campaign.total_links || 0}</div>
                      <div className="text-xs text-muted-foreground">Links</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-lg font-semibold">{campaign.total_clicks || 0}</div>
                      <div className="text-xs text-muted-foreground">Clicks</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-lg font-semibold">{campaign.total_visitors || 0}</div>
                      <div className="text-xs text-muted-foreground">Visitors</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-lg font-semibold">
                        {campaign.total_clicks > 0 ? 
                          ((campaign.total_visitors / campaign.total_clicks) * 100).toFixed(1) + '%' : 
                          '0%'
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Campaign Details */}
                {expandedCampaigns.has(campaign.id) && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Tracking Links</h4>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Link
                      </Button>
                    </div>
                    
                    {campaign.links && campaign.links.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Link ID</th>
                              <th className="text-left py-2">URL</th>
                              <th className="text-left py-2">Clicks</th>
                              <th className="text-left py-2">Visitors</th>
                              <th className="text-left py-2">Status</th>
                              <th className="text-left py-2">Created</th>
                              <th className="text-left py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaign.links.map((link) => (
                              <tr key={link.id} className="border-b hover:bg-muted/50">
                                <td className="py-2">{link.short_code}</td>
                                <td className="py-2 max-w-xs truncate">{link.target_url}</td>
                                <td className="py-2">{link.clicks}</td>
                                <td className="py-2">{link.visitors}</td>
                                <td className="py-2">
                                  {getStatusBadge(link.status)}
                                </td>
                                <td className="py-2">
                                  {link.created_at ? new Date(link.created_at).toLocaleDateString() : 'Unknown'}
                                </td>
                                <td className="py-2">
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-600">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No tracking links found for this campaign
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CampaignManagement;

