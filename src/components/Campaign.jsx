import { useState, useEffect } from 'react'

const Campaign = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    realVisitors: 0,
    botsBlocked: 0,
    activeCampaigns: 0
  })

  useEffect(() => {
    fetchCampaigns()
    fetchAnalytics()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } else {
        console.error('Failed to fetch campaigns')
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching campaign analytics:', error)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-purple-400 rounded"></div>
          <div>
            <h1 className="text-2xl font-bold text-white">Campaign Management</h1>
            <p className="text-slate-400">Advanced campaign analytics and management dashboard</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
            Delete All
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
            Create Campaign
          </button>
        </div>
      </div>

      {/* Compact Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <div className="h-5 w-5 bg-blue-400 rounded"></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Clicks</p>
              <p className="text-xl font-bold text-white">{analytics.totalClicks.toLocaleString()}</p>
              <p className="text-xs text-green-400">Live Data</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <div className="h-5 w-5 bg-green-400 rounded"></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Opens</p>
              <p className="text-xl font-bold text-white">12.3K</p>
              <p className="text-xs text-green-400">+8.7%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <div className="h-5 w-5 bg-purple-400 rounded"></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Emails</p>
              <p className="text-xl font-bold text-white">890</p>
              <p className="text-xs text-green-400">+15.2%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <div className="h-5 w-5 bg-orange-400 rounded"></div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Conv. Rate</p>
              <p className="text-xl font-bold text-white">12.5%</p>
              <p className="text-xs text-green-400">+2.1%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Performing Campaign - Compact */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/20 rounded-lg">
              <div className="h-6 w-6 bg-yellow-400 rounded"></div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🏆 Best Performing Campaign
              </h3>
              <p className="text-purple-300">Summer Sale 2024</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">15.4K</p>
            <p className="text-sm text-purple-300">Total Clicks</p>
          </div>
        </div>
      </div>

      {/* Search and Filters - Compact */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute left-3 top-3 h-4 w-4 bg-slate-400 rounded"></div>
          <input
            placeholder="Search by campaign name, email, tracking ID, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-600 text-white rounded-lg focus:border-purple-500 focus:outline-none"
          />
        </div>
        <select className="w-48 bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:border-purple-500 focus:outline-none">
          <option value="all">All Campaigns</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Campaign Table - Modern Design */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Campaign Dashboard</h3>
              <p className="text-slate-400">3 campaigns found</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                📊 Analytics
              </button>
              <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
                📥 Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left text-slate-300 p-4 font-medium">Campaign</th>
                <th className="text-left text-slate-300 p-4 font-medium">Status</th>
                <th className="text-left text-slate-300 p-4 font-medium">Performance</th>
                <th className="text-left text-slate-300 p-4 font-medium">Engagement</th>
                <th className="text-left text-slate-300 p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                    Loading campaigns...
                  </td>
                </tr>
              ) : (
                <>
                  <tr className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">SS</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Summer Sale 2024</p>
                          <p className="text-sm text-slate-400">Promotional campaign for summer products</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm font-medium">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        Active
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">15,420</span>
                          <span className="text-xs text-slate-400">clicks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">1,230</span>
                          <span className="text-xs text-slate-400">conversions</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">12,340</span>
                          <span className="text-xs text-slate-400">opens</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">890</span>
                          <span className="text-xs text-slate-400">emails</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Expand">
                          <span className="text-sm">▼</span>
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Download">
                          <span className="text-sm">📥</span>
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Pause">
                          <span className="text-sm">⏸</span>
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Delete">
                          <span className="text-sm">🗑</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">PL</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Product Launch</p>
                          <p className="text-sm text-slate-400">New product announcement campaign</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-sm font-medium">
                        <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                        Paused
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">8,930</span>
                          <span className="text-xs text-slate-400">clicks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">670</span>
                          <span className="text-xs text-slate-400">conversions</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">7,200</span>
                          <span className="text-xs text-slate-400">opens</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">520</span>
                          <span className="text-xs text-slate-400">emails</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Expand">
                          <span className="text-sm">▼</span>
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Download">
                          <span className="text-sm">📥</span>
                        </button>
                        <button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="Resume">
                          <span className="text-sm">▶</span>
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Delete">
                          <span className="text-sm">🗑</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  <tr className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">HS</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Holiday Special</p>
                          <p className="text-sm text-slate-400">Holiday season promotional campaign</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-sm font-medium">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        Draft
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-sm">0</span>
                          <span className="text-xs text-slate-500">clicks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-sm">0</span>
                          <span className="text-xs text-slate-500">conversions</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-sm">0</span>
                          <span className="text-xs text-slate-500">opens</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono text-sm">0</span>
                          <span className="text-xs text-slate-500">emails</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Expand">
                          <span className="text-sm">▼</span>
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors" title="Download">
                          <span className="text-sm">📥</span>
                        </button>
                        <button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors" title="Start">
                          <span className="text-sm">▶</span>
                        </button>
                        <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors" title="Delete">
                          <span className="text-sm">🗑</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Campaigns</p>
              <p className="text-2xl font-bold text-green-400">1</p>
            </div>
            <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-green-400 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Budget</p>
              <p className="text-2xl font-bold text-blue-400">$16K</p>
            </div>
            <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-blue-400 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg. Performance</p>
              <p className="text-2xl font-bold text-purple-400">8.7%</p>
            </div>
            <div className="h-8 w-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-purple-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Campaign

