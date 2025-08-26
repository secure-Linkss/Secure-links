import { useState, useEffect } from 'react'

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
      const response = await fetch('/api/links/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
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
      const response = await fetch('/api/links', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
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
      const response = await fetch('/api/links/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          originalUrl: formData.originalUrl,
          title: '',
          campaign: formData.campaign,
          domain: formData.domain,
          customDomain: '',
          expiryDate: '',
          password: '',
          description: '',
          expiration_period: formData.expiration_period
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
        await fetchLinks() // Refresh the links list
        await fetchStats() // Refresh the stats
      } else {
        const errorData = await response.json()
        setFormError(errorData.error || 'Failed to create link')
      }
    } catch (error) {
      setFormError('Network error occurred')
    } finally {
      setFormLoading(false)
    }
  }


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold">✂️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Link Shortener</h1>
            <p className="text-slate-400">Create and manage short links</p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          ✂️ Create Short Link
        </button>
      </div>

      {/* Compact Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <span className="text-blue-400 text-lg">🔗</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Links</p>
              <p className="text-xl font-bold text-white">{stats.totalLinks}</p>
              <p className="text-xs text-green-400">+{Math.floor(stats.totalLinks * 0.5)} this week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <span className="text-green-400 text-lg">👆</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Clicks</p>
              <p className="text-xl font-bold text-white">{stats.totalClicks.toLocaleString()}</p>
              <p className="text-xs text-green-400">+{((stats.totalClicks * 0.153) || 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <span className="text-purple-400 text-lg">✅</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Active Links</p>
              <p className="text-xl font-bold text-white">{stats.activeLinks}</p>
              <p className="text-xs text-slate-400">{stats.totalLinks - stats.activeLinks} expired</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <span className="text-orange-400 text-lg">📊</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Avg. CTR</p>
              <p className="text-xl font-bold text-white">{stats.avgCTR.toFixed(1)}%</p>
              <p className="text-xs text-green-400">+{(stats.avgCTR * 0.07).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-3 h-4 w-4 bg-slate-400 rounded"></div>
          <input
            placeholder="Search by original URL, short code, or campaign name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select className="w-48 bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 focus:outline-none">
          <option value="all">All Links</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="campaign">With Campaign</option>
        </select>
        <button className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg">
          📥 Export CSV
        </button>
      </div>

      {/* Links Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Link Shortener Dashboard</h3>
              <p className="text-slate-400">{links.length} links found</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                📊 Analytics
              </button>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                🔄 Bulk Actions
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left text-slate-300 p-4 font-medium">Short Link</th>
                <th className="text-left text-slate-300 p-4 font-medium">Original URL</th>
                <th className="text-left text-slate-300 p-4 font-medium">Performance</th>
                <th className="text-left text-slate-300 p-4 font-medium">Campaign</th>
                <th className="text-left text-slate-300 p-4 font-medium">Status</th>
                <th className="text-left text-slate-300 p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                    Loading links...
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-700 text-blue-400 px-2 py-1 rounded text-sm font-mono">
                            {link.shortUrl}
                          </code>
                          <button 
                            onClick={() => copyToClipboard(link.shortUrl)}
                            className="p-1 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                            title="Copy"
                          >
                            <span className="text-xs">📋</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-400">Created: {link.created}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="text-white text-sm truncate" title={link.originalUrl}>
                          {link.originalUrl}
                        </p>
                        <p className="text-xs text-slate-400">
                          {link.expiry ? `Expires: ${link.expiry}` : 'Never expires'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{link.clicks.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">clicks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{link.visitors.toLocaleString()}</span>
                          <span className="text-xs text-slate-400">visitors</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {link.campaign ? (
                        <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-sm">
                          📊 {link.campaign}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-sm">No campaign</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                        link.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        <div className={`h-2 w-2 rounded-full ${
                          link.status === 'Active' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        {link.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Analytics">
                          <span className="text-sm">📊</span>
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Edit">
                          <span className="text-sm">✏️</span>
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="QR Code">
                          <span className="text-sm">📱</span>
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Share">
                          <span className="text-sm">🔗</span>
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Delete">
                          <span className="text-sm">🗑️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Most Clicked</p>
              <p className="text-lg font-bold text-white">blt.ly/def456</p>
              <p className="text-xs text-green-400">2,340 clicks</p>
            </div>
            <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400">🏆</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Best CTR</p>
              <p className="text-lg font-bold text-white">77.8%</p>
              <p className="text-xs text-blue-400">blt.ly/def456</p>
            </div>
            <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400">📈</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Recent Activity</p>
              <p className="text-lg font-bold text-white">12</p>
              <p className="text-xs text-purple-400">clicks today</p>
            </div>
            <div className="h-8 w-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400">⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create Short Link</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600 text-red-400 rounded-lg">
                {formError}
              </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Original URL
                </label>
                <input
                  type="url"
                  name="originalUrl"
                  value={formData.originalUrl}
                  onChange={handleFormChange}
                  placeholder="https://example.com/your-long-url"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custom Short Code (Optional)
                </label>
                <input
                  type="text"
                  name="customShortCode"
                  value={formData.customShortCode}
                  onChange={handleFormChange}
                  placeholder="my-custom-link"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Domain
                </label>
                <select 
                  name="domain"
                  value={formData.domain}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="vercel">Vercel Domain (Free)</option>
                  <option value="shortio">Short.io Integration</option>
                  <option value="custom">Custom Domain</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign (Optional)
                </label>
                <select 
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">No Campaign</option>
                  <option value="summer-sale">Summer Sale 2024</option>
                  <option value="winter-promo">Winter Promotion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Link Expiration
                </label>
                <select 
                  name="expiration_period"
                  value={formData.expiration_period}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="never">Never Expires</option>
                  <option value="5hrs">5 Hours</option>
                  <option value="10hrs">10 Hours</option>
                  <option value="24hrs">24 Hours</option>
                  <option value="48hrs">48 Hours</option>
                  <option value="72hrs">72 Hours</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkShortener

