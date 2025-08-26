import { useState, useEffect } from 'react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const mockData = {
    overview: {
      totalClicks: 15420,
      uniqueVisitors: 8930,
      conversionRate: 12.5,
      bounceRate: 34.2,
      capturedEmails: 1410,
      activeLinks: 38
    },
    topCampaigns: [
      { name: 'Summer Sale 2024', clicks: 5420, conversions: 680, rate: 12.5 },
      { name: 'Product Launch', clicks: 3890, conversions: 456, rate: 11.7 },
      { name: 'Newsletter Signup', clicks: 2340, conversions: 312, rate: 13.3 }
    ],
    devices: [
      { name: 'Desktop', value: 45, color: '#3B82F6' },
      { name: 'Mobile', value: 42, color: '#10B981' },
      { name: 'Tablet', value: 13, color: '#8B5CF6' }
    ],
    countries: [
      { name: 'United States', clicks: 4520, flag: '🇺🇸', percentage: 32.1 },
      { name: 'United Kingdom', clicks: 2840, flag: '🇬🇧', percentage: 20.2 },
      { name: 'Canada', clicks: 2100, flag: '🇨🇦', percentage: 14.9 },
      { name: 'Germany', clicks: 1890, flag: '🇩🇪', percentage: 13.4 }
    ]
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-purple-400 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold">📊</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-slate-400">Your comprehensive performance overview</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            🔄 Refresh
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">
            📥 Export
          </button>
        </div>
      </div>

      {/* Key Metrics - Compact Design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <span className="text-blue-400 text-lg">👆</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Total Clicks</p>
              <p className="text-xl font-bold text-white">15.4K</p>
              <p className="text-xs text-green-400">+15.2% vs last period</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <span className="text-green-400 text-lg">👥</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Visitors</p>
              <p className="text-xl font-bold text-white">8.9K</p>
              <p className="text-xs text-green-400">+8.7% vs last period</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <span className="text-purple-400 text-lg">📈</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Conv. Rate</p>
              <p className="text-xl font-bold text-white">12.5%</p>
              <p className="text-xs text-green-400">+2.1% vs last period</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <span className="text-orange-400 text-lg">📧</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Emails</p>
              <p className="text-xl font-bold text-white">1.4K</p>
              <p className="text-xs text-green-400">+18.3% vs last period</p>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Trends Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Traffic Trends</h3>
            <p className="text-slate-400">Clicks, visitors, and conversions over time</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">
              📊 Clicks
            </button>
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">
              👥 Visitors
            </button>
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">
              📈 Conversions
            </button>
          </div>
        </div>
        
        {/* Simplified Chart Visualization */}
        <div className="bg-slate-900 rounded-lg p-6 h-64 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-lg"></div>
          <div className="relative h-full flex items-end justify-between">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                  style={{ 
                    height: `${Math.random() * 80 + 20}%`, 
                    width: '20px' 
                  }}
                ></div>
                <span className="text-xs text-slate-400">
                  {new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Top Performing Campaigns</h3>
            <p className="text-sm text-slate-400">Best campaigns by conversion rate</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {mockData.topCampaigns.map((campaign, index) => (
                <div key={campaign.name} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-500/20' : index === 1 ? 'bg-blue-500/20' : 'bg-purple-500/20'
                    }`}>
                      <span className="text-lg">
                        {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-slate-400">{campaign.clicks.toLocaleString()} clicks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{campaign.rate}%</p>
                    <p className="text-sm text-slate-400">{campaign.conversions} conv.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Device Breakdown</h3>
            <p className="text-sm text-slate-400">Traffic distribution by device type</p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {mockData.devices.map((device) => (
                <div key={device.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: device.color }}
                      ></div>
                      <span className="text-white font-medium">{device.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{device.value}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${device.value}%`,
                        backgroundColor: device.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Performance */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Geographic Performance</h3>
          <p className="text-sm text-slate-400">Top performing countries and regions</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockData.countries.map((country) => (
              <div key={country.name} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{country.flag}</span>
                  <div>
                    <p className="font-medium text-white">{country.name}</p>
                    <p className="text-sm text-slate-400">{country.percentage}% of traffic</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Clicks:</span>
                    <span className="text-sm font-mono text-white">{country.clicks.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Bounce Rate</p>
              <p className="text-2xl font-bold text-orange-400">34.2%</p>
              <p className="text-xs text-red-400">-1.8% vs last period</p>
            </div>
            <div className="h-8 w-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <span className="text-orange-400">📉</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg. Session</p>
              <p className="text-2xl font-bold text-blue-400">2m 34s</p>
              <p className="text-xs text-green-400">+12s vs last period</p>
            </div>
            <div className="h-8 w-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400">⏱️</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Links</p>
              <p className="text-2xl font-bold text-green-400">38</p>
              <p className="text-xs text-green-400">+5 this week</p>
            </div>
            <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400">🔗</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

