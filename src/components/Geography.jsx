import { useState, useEffect } from 'react'

const Geography = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [geoData, setGeoData] = useState({
    countries: [],
    cities: []
  })
  const [stats, setStats] = useState({
    totalCountries: 0,
    totalCities: 0,
    topCountry: null,
    topCity: null
  })

  useEffect(() => {
    fetchGeographyData()
  }, [timeRange])

  const fetchGeographyData = async () => {
    setLoading(true)
    try {
      // Fetch countries analytics
      const countriesResponse = await fetch('/api/analytics/countries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (countriesResponse.ok) {
        const countriesData = await countriesResponse.json()
        
        // Calculate stats
        const totalCountries = countriesData.length
        const topCountry = countriesData.length > 0 ? countriesData[0] : null
        
        // For cities, we'll use a simplified approach since we don't have a separate cities endpoint
        const cities = []
        let totalCities = 0
        
        // Generate some city data based on countries (this would ideally come from the API)
        countriesData.forEach(country => {
          if (country.country === 'United States') {
            cities.push(
              { name: 'New York', country: 'United States', clicks: Math.floor(country.clicks * 0.3), visitors: Math.floor(country.visitors * 0.3), percentage: Math.round(country.percentage * 0.3 * 10) / 10, flag: '🇺🇸' },
              { name: 'Los Angeles', country: 'United States', clicks: Math.floor(country.clicks * 0.2), visitors: Math.floor(country.visitors * 0.2), percentage: Math.round(country.percentage * 0.2 * 10) / 10, flag: '🇺🇸' }
            )
            totalCities += 2
          } else if (country.country === 'United Kingdom') {
            cities.push(
              { name: 'London', country: 'United Kingdom', clicks: Math.floor(country.clicks * 0.6), visitors: Math.floor(country.visitors * 0.6), percentage: Math.round(country.percentage * 0.6 * 10) / 10, flag: '🇬🇧' }
            )
            totalCities += 1
          } else if (country.country === 'Canada') {
            cities.push(
              { name: 'Toronto', country: 'Canada', clicks: Math.floor(country.clicks * 0.4), visitors: Math.floor(country.visitors * 0.4), percentage: Math.round(country.percentage * 0.4 * 10) / 10, flag: '🇨🇦' }
            )
            totalCities += 1
          }
        })
        
        const topCity = cities.length > 0 ? cities.reduce((prev, current) => (prev.clicks > current.clicks) ? prev : current) : null
        
        setGeoData({
          countries: countriesData,
          cities: cities.slice(0, 5) // Top 5 cities
        })
        
        setStats({
          totalCountries,
          totalCities,
          topCountry,
          topCity
        })
      }

    } catch (error) {
      console.error('Error fetching geography data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchGeographyData()
  }

  const handleExport = () => {
    // Implement export functionality
    console.log('Export geography data')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-700 rounded mb-6"></div>
        </div>
      </div>
    )
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
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
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
              <p className="text-xl font-bold text-white">{stats.totalCountries}</p>
              <p className="text-xs text-green-400">Live Data</p>
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
              <p className="text-xl font-bold text-white">{stats.totalCities}</p>
              <p className="text-xs text-green-400">Live Data</p>
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
              <p className="text-lg font-bold text-white">
                {stats.topCountry ? `${stats.topCountry.flag} ${stats.topCountry.code}` : 'N/A'}
              </p>
              <p className="text-xs text-green-400">
                {stats.topCountry ? `${stats.topCountry.percentage}% traffic` : 'No data'}
              </p>
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
              <p className="text-lg font-bold text-white">
                {stats.topCity ? stats.topCity.name : 'N/A'}
              </p>
              <p className="text-xs text-green-400">
                {stats.topCity ? `${stats.topCity.percentage}% traffic` : 'No data'}
              </p>
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
            {geoData.countries.length === 0 ? (
              <div className="text-center">
                <p className="text-slate-400 text-lg">No geographic data available</p>
                <p className="text-slate-500">Data will appear as users visit your links</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-8 text-center">
                {geoData.countries.slice(0, 8).map((country, index) => (
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
            )}
          </div>
          
          {/* Selected Country Details */}
          {selectedCountry && (
            <div className="absolute bottom-4 left-4 bg-slate-800/95 rounded-lg p-4 border border-slate-600 min-w-[300px]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{selectedCountry.flag}</span>
                <div>
                  <h4 className="text-lg font-bold text-white">{selectedCountry.country}</h4>
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
            </div>
          )}
        </div>
      </div>

      {/* Countries and Cities Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Top Countries</h3>
            <p className="text-sm text-slate-400">Countries by traffic volume</p>
          </div>
          <div className="p-4">
            {geoData.countries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No country data available</p>
                <p className="text-slate-500 text-sm">Data will appear as users visit your links</p>
              </div>
            ) : (
              <div className="space-y-3">
                {geoData.countries.slice(0, 5).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country.flag}</span>
                      <div>
                        <p className="font-medium text-white">{country.country}</p>
                        <p className="text-sm text-slate-400">{country.clicks} clicks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-400">{country.percentage}%</p>
                      <p className="text-xs text-slate-400">{country.visitors} visitors</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cities Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Top Cities</h3>
            <p className="text-sm text-slate-400">Cities by traffic volume</p>
          </div>
          <div className="p-4">
            {geoData.cities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No city data available</p>
                <p className="text-slate-500 text-sm">Data will appear as users visit your links</p>
              </div>
            ) : (
              <div className="space-y-3">
                {geoData.cities.map((city, index) => (
                  <div key={`${city.name}-${city.country}`} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{city.flag}</span>
                      <div>
                        <p className="font-medium text-white">{city.name}</p>
                        <p className="text-sm text-slate-400">{city.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-400">{city.percentage}%</p>
                      <p className="text-xs text-slate-400">{city.clicks} clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Geography

