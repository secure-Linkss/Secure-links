import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Legend
} from 'recharts';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('7');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [analytics, setAnalytics] = useState({
    totalLinks: 0,
    totalClicks: 0,
    realVisitors: 0,
    capturedEmails: 0,
    totalCampaigns: 0,
    activeLinks: 0,
    conversionRate: 0,
    avgClicksPerLink: 0
  });

  const [realtimeData, setRealtimeData] = useState({
    clicksToday: 0,
    visitorsOnline: 0,
    lastActivity: null,
    topCountryToday: null
  });

  // Live data states
  const [campaignData, setCampaignData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [capturedEmails, setCapturedEmails] = useState([]);
  const [clicksOverTimeData, setClicksOverTimeData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);

  // Fetch live data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch analytics data
        const analyticsResponse = await fetch('/api/analytics/overview');
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData);
        }

        // Fetch campaigns data
        const campaignsResponse = await fetch('/api/campaigns');
        if (campaignsResponse.ok) {
          const campaigns = await campaignsResponse.json();
          setCampaignData(campaigns);
        }

        // Fetch countries data
        const countriesResponse = await fetch('/api/analytics/countries');
        if (countriesResponse.ok) {
          const countries = await countriesResponse.json();
          setCountryData(countries);
        }

        // Fetch captured emails
        const emailsResponse = await fetch('/api/analytics/captured-emails');
        if (emailsResponse.ok) {
          const emails = await emailsResponse.json();
          setCapturedEmails(emails);
        }

        // Fetch clicks over time
        const clicksResponse = await fetch(`/api/analytics/clicks-over-time?days=${timeFilter}`);
        if (clicksResponse.ok) {
          const clicks = await clicksResponse.json();
          setClicksOverTimeData(clicks);
        }

        // Fetch device data
        const deviceResponse = await fetch('/api/analytics/devices');
        if (deviceResponse.ok) {
          const devices = await deviceResponse.json();
          setDeviceData(devices);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to empty data on error
        setCampaignData([]);
        setCountryData([]);
        setCapturedEmails([]);
        setClicksOverTimeData([]);
        setDeviceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeFilter]);

  // Refresh data function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch fresh data from API
      const analyticsResponse = await fetch('/api/analytics/overview');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredData(null);
      return;
    }

    const term = searchTerm.toLowerCase();
    let results = {
      campaigns: [],
      emails: [],
      countries: []
    };

    switch (searchType) {
      case 'campaigns':
        results.campaigns = campaignData.filter(camp => 
          camp.name.toLowerCase().includes(term) || 
          camp.trackingId.toLowerCase().includes(term)
        );
        break;
      case 'emails':
        results.emails = capturedEmails.filter(email => 
          email.email.toLowerCase().includes(term) ||
          email.campaign.toLowerCase().includes(term) ||
          email.trackingId.toLowerCase().includes(term)
        );
        break;
      case 'countries':
        results.countries = countryData.filter(country => 
          country.country.toLowerCase().includes(term) ||
          country.code.toLowerCase().includes(term)
        );
        break;
      default:
        results.campaigns = campaignData.filter(camp => 
          camp.name.toLowerCase().includes(term) || 
          camp.trackingId.toLowerCase().includes(term)
        );
        results.emails = capturedEmails.filter(email => 
          email.email.toLowerCase().includes(term) ||
          email.campaign.toLowerCase().includes(term) ||
          email.trackingId.toLowerCase().includes(term)
        );
        results.countries = countryData.filter(country => 
          country.country.toLowerCase().includes(term) ||
          country.code.toLowerCase().includes(term)
        );
    }

    setFilteredData(results);
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      // Fetch fresh data from API
      const analyticsResponse = await fetch('/api/analytics/overview');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = () => {
    const dataToExport = {
      analytics,
      campaigns: campaignData,
      countries: countryData,
      emails: capturedEmails,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain-link-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const timeFilters = [
    { value: '1', label: '24h' },
    { value: '7', label: '7d' },
    { value: '30', label: '30d' },
    { value: '90', label: '90d' }
  ];

  const searchTypes = [
    { value: 'all', label: 'All' },
    { value: 'campaign', label: 'Campaigns' },
    { value: 'email', label: 'Emails' },
    { value: 'country', label: 'Countries' }
  ];

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header with Search - All on one line */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics Dashboard</h1>
          <p className="text-slate-400">Comprehensive tracking and performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Advanced Search */}
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-600 rounded-lg bg-slate-800 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {searchTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <div className="relative">
            <input
              type="text"
              placeholder="Search campaigns, emails, tracking IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Time Filters */}
          {timeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                timeFilter === filter.value 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
                }`}
              >
                {filter.label}
              </button>
            ))}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshClick}
              disabled={refreshing}
              className="px-4 py-2 text-sm font-medium text-blue-400 bg-slate-800 border border-blue-500 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {filteredData && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results for "{searchTerm}"</h3>
          
          {filteredData.campaigns.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Campaigns ({filteredData.campaigns.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredData.campaigns.map(campaign => (
                  <div key={campaign.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 text-sm">{campaign.name}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">ID: {campaign.trackingId}</p>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{campaign.clicks} clicks</span>
                      <span>{campaign.emails} emails</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredData.emails.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Captured Emails ({filteredData.emails.length})</h4>
              <div className="space-y-2">
                {filteredData.emails.slice(0, 5).map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{email.email}</p>
                      <p className="text-xs text-gray-600">{email.campaign} • {email.trackingId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{email.country}</p>
                      <p className="text-xs text-gray-500">{email.captured}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredData.countries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Countries ({filteredData.countries.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredData.countries.map(country => (
                  <div key={country.code} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{country.flag}</span>
                      <h5 className="font-medium text-gray-900 text-sm">{country.country}</h5>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{country.clicks} clicks</span>
                      <span>{country.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Total Links</p>
              <p className="text-lg font-bold text-white">{analytics.totalLinks}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Total Clicks</p>
              <p className="text-lg font-bold text-white">{analytics.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Real Visitors</p>
              <p className="text-lg font-bold text-white">{analytics.realVisitors.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-orange-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Captured Emails</p>
              <p className="text-lg font-bold text-white">{analytics.capturedEmails}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Active Links</p>
              <p className="text-lg font-bold text-white">{analytics.activeLinks}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-yellow-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Conversion Rate</p>
              <p className="text-lg font-bold text-white">{analytics.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-teal-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Countries</p>
              <p className="text-lg font-bold text-white">{countryData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Performance Over Time */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Performance Over Time</h3>
              <p className="text-sm text-slate-400">Clicks, visitors, and email captures</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={clicksOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#64748b' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stackId="1"
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="emails" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Device Breakdown</h3>
              <p className="text-sm text-slate-400">Traffic distribution by device type</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569', 
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top Countries */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Top Countries</h3>
              <p className="text-sm text-slate-400">Geographic distribution</p>
            </div>
          </div>
          <div className="space-y-3">
            {countryData.slice(0, 6).map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{country.flag}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{country.country}</p>
                    <p className="text-xs text-slate-400">{country.clicks} clicks • {country.emails} emails</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{country.percentage}%</p>
                  <div className="w-16 bg-slate-700 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
              <p className="text-sm text-slate-400">Top performing campaigns</p>
            </div>
          </div>
          <div className="space-y-3">
            {campaignData.slice(0, 5).map((campaign, index) => (
              <div key={index} className="p-3 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white">{campaign.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    campaign.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>ID: {campaign.trackingId}</span>
                  <span>{campaign.conversionRate}% conversion</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{campaign.clicks} clicks</span>
                  <span>{campaign.emails} emails</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Captured Emails */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Captures</h3>
              <p className="text-sm text-slate-400">Latest email captures</p>
            </div>
          </div>
          <div className="space-y-3">
            {capturedEmails.slice(0, 5).map((email, index) => (
              <div key={index} className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium text-white">{email.email}</p>
                  <p className="text-xs text-slate-300">{email.country}</p>
                </div>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs text-slate-300">{email.campaign}</p>
                  <p className="text-xs text-slate-400">{new Date(email.captured).toLocaleDateString('en-GB')}</p>
                </div>
                <p className="text-xs text-slate-400">ID: {email.trackingId}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

