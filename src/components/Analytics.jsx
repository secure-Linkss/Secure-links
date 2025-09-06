import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  Mail, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet,
  RefreshCw,
  Download,
  Calendar,
  Target,
  Eye,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    bounceRate: 0,
    capturedEmails: 0,
    activeLinks: 0,
    avgSessionDuration: 0
  })
  const [topCampaigns, setTopCampaigns] = useState([])
  const [devices, setDevices] = useState([])
  const [countries, setCountries] = useState([])
  const [performanceData, setPerformanceData] = useState([])

  // Sample data for demonstration
  const samplePerformanceData = [
    { date: '2024-01-14', clicks: 1200, visitors: 960, conversions: 180, bounceRate: 32 },
    { date: '2024-01-15', clicks: 1350, visitors: 1080, conversions: 203, bounceRate: 28 },
    { date: '2024-01-16', clicks: 1100, visitors: 880, conversions: 165, bounceRate: 35 },
    { date: '2024-01-17', clicks: 1450, visitors: 1160, conversions: 218, bounceRate: 25 },
    { date: '2024-01-18', clicks: 1600, visitors: 1280, conversions: 240, bounceRate: 22 },
    { date: '2024-01-19', clicks: 1380, visitors: 1104, conversions: 207, bounceRate: 30 },
    { date: '2024-01-20', clicks: 1520, visitors: 1216, conversions: 228, bounceRate: 26 }
  ]

  const sampleDeviceData = [
    { name: 'Desktop', value: 2845, percentage: 45, color: '#3b82f6' },
    { name: 'Mobile', value: 2530, percentage: 40, color: '#10b981' },
    { name: 'Tablet', value: 950, percentage: 15, color: '#f59e0b' }
  ]

  const sampleCountryData = [
    { name: 'United States', clicks: 1850, percentage: 29.2, flag: '🇺🇸' },
    { name: 'United Kingdom', clicks: 1240, percentage: 19.6, flag: '🇬🇧' },
    { name: 'Canada', clicks: 980, percentage: 15.5, flag: '🇨🇦' },
    { name: 'Germany', clicks: 760, percentage: 12.0, flag: '🇩🇪' },
    { name: 'Australia', clicks: 620, percentage: 9.8, flag: '🇦🇺' },
    { name: 'Others', clicks: 875, percentage: 13.9, flag: '🌍' }
  ]

  const sampleCampaignData = [
    { name: 'Summer Sale 2024', clicks: 3240, conversions: 486, rate: 15.0, status: 'active' },
    { name: 'Product Launch', clicks: 2890, conversions: 404, rate: 14.0, status: 'active' },
    { name: 'Newsletter Campaign', clicks: 2150, conversions: 280, rate: 13.0, status: 'paused' },
    { name: 'Social Media Push', clicks: 1980, conversions: 237, rate: 12.0, status: 'active' },
    { name: 'Email Marketing', clicks: 1750, conversions: 193, rate: 11.0, status: 'completed' }
  ]

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Use sample data for now
      setAnalytics({
        totalClicks: 6325,
        uniqueVisitors: 5060,
        conversionRate: 14.2,
        bounceRate: 28.5,
        capturedEmails: 898,
        activeLinks: 45,
        avgSessionDuration: 3.2
      })
      
      setTopCampaigns(sampleCampaignData)
      setCountries(sampleCountryData)
      setDevices(sampleDeviceData)
      setPerformanceData(samplePerformanceData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive performance insights and detailed metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24h</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Compact Metric Cards - 7 cards in one row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Clicks</p>
                <p className="text-xl font-bold">{analytics.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Unique Visitors</p>
                <p className="text-xl font-bold">{analytics.uniqueVisitors.toLocaleString()}</p>
              </div>
              <Users className="h-4 w-4 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-purple-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Conversion Rate</p>
                <p className="text-xl font-bold">{analytics.conversionRate}%</p>
              </div>
              <Target className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-orange-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Bounce Rate</p>
                <p className="text-xl font-bold">{analytics.bounceRate}%</p>
              </div>
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-teal-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Captured Emails</p>
                <p className="text-xl font-bold">{analytics.capturedEmails}</p>
              </div>
              <Mail className="h-4 w-4 text-teal-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Active Links</p>
                <p className="text-xl font-bold">{analytics.activeLinks}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-pink-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Avg Session</p>
                <p className="text-xl font-bold">{analytics.avgSessionDuration}m</p>
              </div>
              <Clock className="h-4 w-4 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Side by Side (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Over Time Chart */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Performance Trends</CardTitle>
            <p className="text-xs text-muted-foreground">Clicks, visitors, and conversions over time</p>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.split('-')[2]}
                />
                <YAxis 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorConversions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown Chart */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Device Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Traffic breakdown by device type</p>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={devices}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {devices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value.toLocaleString(), name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {devices.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-muted-foreground">
                    {item.name} {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution Chart */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Geographic Distribution</CardTitle>
            <p className="text-xs text-muted-foreground">Top countries by traffic volume</p>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={countries.slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  type="number"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Performance Chart */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Campaign Performance</CardTitle>
            <p className="text-xs text-muted-foreground">Top performing campaigns by conversion rate</p>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCampaigns.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Countries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Countries</CardTitle>
            <CardDescription>Traffic distribution by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {countries.slice(0, 6).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{country.flag}</span>
                    <div>
                      <p className="font-medium text-sm">{country.name}</p>
                      <p className="text-xs text-muted-foreground">{country.clicks.toLocaleString()} clicks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{country.percentage}%</p>
                    <Progress value={country.percentage} className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Campaign Performance</CardTitle>
            <CardDescription>Top performing campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCampaigns.slice(0, 5).map((campaign, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.clicks.toLocaleString()} clicks • {campaign.conversions} conversions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.rate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics

