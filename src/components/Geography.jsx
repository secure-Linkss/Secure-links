import { useState, useEffect } from 'react'

const Geography = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [timeRange])

  const mockGeoData = {
    countries: [
      { name: 'United States', code: 'US', clicks: 4520, visitors: 2890, percentage: 32.1, flag: '🇺🇸', color: '#3B82F6' },
      { name: 'United Kingdom', code: 'GB', clicks: 2840, visitors: 1920, percentage: 20.2, flag: '🇬🇧', color: '#10B981' },
      { name: 'Canada', code: 'CA', clicks: 2100, visitors: 1450, percentage: 14.9, flag: '🇨🇦', color: '#8B5CF6' },
      { name: 'Germany', code: 'DE', clicks: 1890, visitors: 1280, percentage: 13.4, flag: '🇩🇪', color: '#F59E0B' },
      { name: 'France', code: 'FR', clicks: 1620, visitors: 1100, percentage: 11.5, flag: '🇫🇷', color: '#EF4444' },
      { name: 'Australia', code: 'AU', clicks: 1200, visitors: 820, percentage: 8.5, flag: '🇦🇺', color: '#06B6D4' },
      { name: 'Netherlands', code: 'NL', clicks: 890, visitors: 610, percentage: 6.3, flag: '🇳🇱', color: '#84CC16' },
      { name: 'Sweden', code: 'SE', clicks: 720, visitors: 490, percentage: 5.1, flag: '🇸🇪', color: '#F97316' }
    ],
    cities: [
      { name: 'New York', country: 'United States', clicks: 1250, visitors: 850, percentage: 8.9, flag: '🇺🇸' },
      { name: 'London', country: 'United Kingdom', clicks: 1180, visitors: 790, percentage: 8.4, flag: '🇬🇧' },
      { name: 'Toronto', country: 'Canada', clicks: 920, visitors: 630, percentage: 6.5, flag: '🇨🇦' },
      { name: 'Los Angeles', country: 'United States', clicks: 890, visitors: 600, percentage: 6.3, flag: '🇺🇸' },
      { name: 'Berlin', country: 'Germany', clicks: 780, visitors: 520, percentage: 5.5, flag: '🇩🇪' }
    ]
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-green-400 rounded-lg flex items-center justify-center">
            <span className="text-slate-900 font-bold">🌍</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Geography</h1>
            <p className="text-slate-400">Geographic distribution of your traffic</p>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <span className="text-blue-400 text-lg">🌍</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Countries</p>
              <p className="text-xl font-bold text-white">45</p>
              <p className="text-xs text-green-400">+3 this week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <span className="text-green-400 text-lg">🏙️</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Cities</p>
              <p className="text-xl font-bold text-white">128</p>
              <p className="text-xs text-green-400">+12 this week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <span className="text-purple-400 text-lg">🏆</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Top Country</p>
              <p className="text-lg font-bold text-white">🇺🇸 USA</p>
              <p className="text-xs text-green-400">32.1% traffic</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <span className="text-orange-400 text-lg">📍</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide">Top City</p>
              <p className="text-lg font-bold text-white">New York</p>
              <p className="text-xs text-green-400">8.9% traffic</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive World Map */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Interactive World Map</h3>
            <p className="text-slate-400">Click on countries to view detailed statistics</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">
              🎯 Heat Map
            </button>
            <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">
              📊 Data View
            </button>
          </div>
        </div>
        
        {/* Simplified World Map Visualization */}
        <div className="bg-slate-900 rounded-lg p-8 min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
          
          {/* Map Legend */}
          <div className="absolute top-4 right-4 bg-slate-800/90 rounded-lg p-3 border border-slate-600">
            <h4 className="text-sm font-semibold text-white mb-2">Traffic Intensity</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-slate-300">High (1000+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs text-slate-300">Medium (500-999)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-slate-300">Low (1-499)</span>
              </div>
            </div>
          </div>
          
          {/* Interactive Country Markers */}
          <div className="relative h-full flex items-center justify-center">
            <div className="grid grid-cols-4 gap-8 text-center">
              {mockGeoData.countries.slice(0, 8).map((country, index) => (
                <div 
                  key={country.code}
                  className="cursor-pointer transform hover:scale-110 transition-all duration-200"
                  onClick={() => setSelectedCountry(country)}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 ${
                    country.clicks > 2000 ? 'bg-red-500/30 border-2 border-red-500' :
                    country.clicks > 1000 ? 'bg-yellow-500/30 border-2 border-yellow-500' :
                    'bg-green-500/30 border-2 border-green-500'
                  }`}>
                    {country.flag}
                  </div>
                  <p className="text-xs text-white font-medium">{country.code}</p>
                  <p className="text-xs text-slate-400">{country.clicks.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Selected Country Details */}
          {selectedCountry && (
            <div className="absolute bottom-4 left-4 bg-slate-800/95 rounded-lg p-4 border border-slate-600 min-w-[300px]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedCountry.name}</h4>
                  <p className="text-sm text-slate-400">{selectedCountry.percentage}% of total traffic</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Total Clicks</p>
                  <p className="text-lg font-bold text-blue-400">{selectedCountry.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Unique Visitors</p>
                  <p className="text-lg font-bold text-green-400">{selectedCountry.visitors.toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCountry(null)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Countries and Cities Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Top Countries</h3>
            <p className="text-sm text-slate-400">Geographic distribution by country</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {mockGeoData.countries.slice(0, 6).map((country, index) => (
                <div key={country.code} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <div>
                      <p className="font-medium text-white">{country.name}</p>
                      <p className="text-sm text-slate-400">{country.percentage}% of traffic</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-white">{country.clicks.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">{country.visitors.toLocaleString()} visitors</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Top Cities</h3>
            <p className="text-sm text-slate-400">Geographic distribution by city</p>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {mockGeoData.cities.map((city, index) => (
                <div key={`${city.name}-${city.country}`} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{city.flag}</span>
                    <div>
                      <p className="font-medium text-white">{city.name}</p>
                      <p className="text-sm text-slate-400">{city.country} • {city.percentage}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-white">{city.clicks.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">{city.visitors.toLocaleString()} visitors</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Regional Distribution</h3>
          <p className="text-sm text-slate-400">Traffic breakdown by world regions</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'North America', clicks: 6620, visitors: 4340, percentage: 47.0, color: 'bg-blue-500' },
              { name: 'Europe', clicks: 5840, visitors: 3900, percentage: 41.5, color: 'bg-green-500' },
              { name: 'Asia Pacific', clicks: 1130, visitors: 760, percentage: 8.0, color: 'bg-purple-500' },
              { name: 'South America', clicks: 580, visitors: 390, percentage: 4.1, color: 'bg-orange-500' },
              { name: 'Africa', clicks: 280, visitors: 190, percentage: 2.0, color: 'bg-red-500' },
              { name: 'Middle East', clicks: 150, visitors: 100, percentage: 1.1, color: 'bg-yellow-500' }
            ].map((region) => (
              <div key={region.name} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 ${region.color} rounded-full`}></div>
                  <h4 className="font-medium text-white">{region.name}</h4>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Clicks:</span>
                    <span className="text-sm font-mono text-white">{region.clicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Visitors:</span>
                    <span className="text-sm font-mono text-white">{region.visitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Share:</span>
                    <span className="text-sm font-bold text-green-400">{region.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Geography

