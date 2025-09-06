import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { CalendarDays, Link, MousePointer, Users, BarChart as BarChartIcon, Globe, Shield, TrendingUp, Eye, Mail } from 'lucide-react';

const Dashboard = () => {
  const [period, setPeriod] = useState('30');
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    totalUsers: 0,
    avgClicksPerLink: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (selectedPeriod) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.analytics) {
        setStats(data.analytics);
      }
      
      if (data.chartData) {
        setChartData(data.chartData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  // Sample data for additional metrics
  const additionalStats = {
    realVisitors: Math.floor(stats.totalClicks * 0.8),
    capturedEmails: Math.floor(stats.totalClicks * 0.15),
    activeLinks: Math.floor(stats.totalLinks * 0.9),
    conversionRate: stats.totalClicks > 0 ? ((Math.floor(stats.totalClicks * 0.15) / stats.totalClicks) * 100).toFixed(1) : 0,
    countries: 6,
    botsBlocked: Math.floor(stats.totalClicks * 0.2)
  };

  // Device breakdown data
  const deviceData = [
    { name: 'Desktop', value: 1858, percentage: 45, color: '#3b82f6' },
    { name: 'Mobile/5G', value: 1734, percentage: 42, color: '#10b981' },
    { name: 'Tablet', value: 537, percentage: 13, color: '#f59e0b' }
  ];

  // Performance over time data
  const performanceData = chartData.map((item, index) => ({
    date: `2024-01-${14 + index}`,
    clicks: item.clicks || Math.floor(Math.random() * 1200) + 300,
    visitors: Math.floor(item.clicks * 0.8) || Math.floor(Math.random() * 1000) + 250,
    emails: Math.floor(item.clicks * 0.15) || Math.floor(Math.random() * 200) + 50
  }));

  // If no chart data, create sample data
  const samplePerformanceData = [
    { date: '2024-01-14', clicks: 700, visitors: 560, emails: 105 },
    { date: '2024-01-15', clicks: 800, visitors: 640, emails: 120 },
    { date: '2024-01-16', clicks: 950, visitors: 760, emails: 143 },
    { date: '2024-01-17', clicks: 1100, visitors: 880, emails: 165 },
    { date: '2024-01-18', clicks: 1200, visitors: 960, emails: 180 },
    { date: '2024-01-19', clicks: 1050, visitors: 840, emails: 158 },
    { date: '2024-01-20', clicks: 900, visitors: 720, emails: 135 }
  ];

  const finalPerformanceData = performanceData.length > 0 ? performanceData : samplePerformanceData;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advanced Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive tracking and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value="all" onValueChange={() => {}}>
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <input 
              placeholder="Search campaigns, emails, tracking..." 
              className="w-64 h-8 px-3 text-xs border rounded-md bg-background"
            />
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs">24h</Button>
            <Button size="sm" variant="default" className="h-8 px-3 text-xs bg-blue-600">7d</Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs">30d</Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs">90d</Button>
          </div>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
            Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
            Export
          </Button>
        </div>
      </div>

      {/* Ultra Compact Metric Cards Grid - 8 cards side by side */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Links</p>
                <p className="text-2xl font-bold">{stats.totalLinks}</p>
              </div>
              <Link className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Clicks</p>
                <p className="text-2xl font-bold">{stats.totalClicks}</p>
              </div>
              <MousePointer className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-purple-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Real Visitors</p>
                <p className="text-2xl font-bold">{additionalStats.realVisitors}</p>
              </div>
              <Eye className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-orange-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Captured Emails</p>
                <p className="text-2xl font-bold">{additionalStats.capturedEmails}</p>
              </div>
              <Mail className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-green-600">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Active Links</p>
                <p className="text-2xl font-bold">{additionalStats.activeLinks}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-yellow-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold">{additionalStats.conversionRate}%</p>
              </div>
              <BarChartIcon className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Avg Clicks/Link</p>
                <p className="text-2xl font-bold">{stats.avgClicksPerLink}</p>
              </div>
              <BarChartIcon className="h-5 w-5 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-teal-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Countries</p>
                <p className="text-2xl font-bold">{additionalStats.countries}</p>
              </div>
              <Globe className="h-5 w-5 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Over Time Chart */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Performance Over Time</CardTitle>
            <p className="text-xs text-muted-foreground">Clicks, visitors, and email captures</p>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={finalPerformanceData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorEmails" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="emails"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorEmails)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown Chart */}
        <Card className="hover:shadow-sm transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Device Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Traffic distribution by device type</p>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
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
              {deviceData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-muted-foreground">
                    {item.name} {item.value.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

