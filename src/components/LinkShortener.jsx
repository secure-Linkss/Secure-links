import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  Plus, 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Search,
  RefreshCw,
  BarChart3,
  MousePointer,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react'

const LinkShortener = () => {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    avgCTR: 0
  })
  const [formData, setFormData] = useState({
    originalUrl: '',
    customShortCode: '',
    domain: 'vercel',
    campaign: '',
    expiration_period: 'never'
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    fetchLinks()
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Use the dashboard endpoint to get analytics data
      const response = await fetch('/api/analytics/dashboard?period=30')
      
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalLinks: data.analytics?.totalLinks || 0,
          totalClicks: data.analytics?.totalClicks || 0,
          activeLinks: data.analytics?.activeLinks || 0,
          avgCTR: data.analytics?.avgClicksPerLink || 0
        })
      } else {
        console.error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/links')
      
      if (response.ok) {
        const data = await response.json()
        setLinks(data.links || [])
      } else {
        console.error('Failed to fetch links')
      }
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLinks()
    await fetchStats()
    setRefreshing(false)
  }

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      console.log("Form data:", formData);
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          original_url: formData.originalUrl,
          title: formData.campaign || 'Untitled Link',
          campaign_name: formData.campaign || 'Default Campaign',
          short_code: formData.customShortCode || undefined
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setShowCreateModal(false)
        setFormData({
          originalUrl: '',
          customShortCode: '',
          domain: 'vercel',
          campaign: '',
          expiration_period: 'never'
        })
        await fetchLinks()
        await fetchStats()
        alert('Link created successfully!')
      } else {
        const errorData = await response.json()
        setFormError(errorData.error || 'Failed to create link')
      }
    } catch (error) {
      console.error('Error creating link:', error)
      setFormError('Failed to create link')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCopyLink = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl)
    alert('Link copied to clipboard!')
  }

  const handleDeleteLink = async (linkId) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchLinks()
        await fetchStats()
        alert('Link deleted successfully!')
      } else {
        alert('Failed to delete link')
      }
    } catch (error) {
      console.error('Error deleting link:', error)
      alert('Failed to delete link')
    }
  }

  const handleToggleLink = async (linkId, currentStatus) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      })
      
      if (response.ok) {
        await fetchLinks()
        await fetchStats()
      } else {
        alert('Failed to update link status')
      }
    } catch (error) {
      console.error('Error updating link:', error)
      alert('Failed to update link')
    }
  }

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.short_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.original_url?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && link.is_active) ||
                         (filterStatus === 'inactive' && !link.is_active)
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading links...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Link Shortener</h1>
          <p className="text-muted-foreground">
            Create and manage your shortened tracking links
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Link</DialogTitle>
                <DialogDescription>
                  Create a new shortened tracking link for your campaign.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="originalUrl">Original URL *</Label>
                  <Input
                    id="originalUrl"
                    name="originalUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.originalUrl}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign Name</Label>
                  <Input
                    id="campaign"
                    name="campaign"
                    placeholder="My Campaign"
                    value={formData.campaign}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customShortCode">Custom Short Code (Optional)</Label>
                  <Input
                    id="customShortCode"
                    name="customShortCode"
                    placeholder="my-link"
                    value={formData.customShortCode}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Select value={formData.domain} onValueChange={(value) => setFormData({...formData, domain: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vercel">Vercel Domain</SelectItem>
                      <SelectItem value="custom">Custom Domain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formError && (
                  <div className="text-red-600 text-sm">{formError}</div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? 'Creating...' : 'Create Link'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeLinks} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              All time clicks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLinks}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Clicks/Link</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCTR.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Per link average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Links</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Links</CardTitle>
          <CardDescription>
            Manage and track your shortened links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLinks.map((link) => (
              <div key={link.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{link.title || 'Untitled Link'}</h3>
                      {getStatusBadge(link.is_active)}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Short URL:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                          {window.location.origin}/t/{link.short_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(`${window.location.origin}/t/${link.short_code}`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Original:</span>
                        <a 
                          href={link.original_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <span className="truncate max-w-md">{link.original_url}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      
                      {link.campaign_name && (
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">Campaign:</span>
                          <span>{link.campaign_name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{link.created_at ? new Date(link.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                        <span>{link.click_count || 0} clicks</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{link.unique_visitors || 0} visitors</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleLink(link.id, link.is_active)}
                    >
                      {link.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLinks.length === 0 && (
              <div className="text-center py-8">
                <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No links found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first shortened link to get started'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Link
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LinkShortener

