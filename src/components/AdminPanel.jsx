import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import CampaignManagement from './CampaignManagement';
import {
  Users,
  Target,
  Shield,
  Settings,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Download,
  Plus,
  User,
  Calendar,
  Mail,
  Crown,
  UserCheck,
  UserX,
  RefreshCw,
  LayoutDashboard,
  CreditCard,
  MessageSquare,
  FileText,
  Lock,
  Trash2
} from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeCampaigns: 0,
    securityThreats: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [userAnalytics, campaignAnalytics] = await Promise.all([
        fetch('/api/admin/analytics/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/admin/analytics/campaigns', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (userAnalytics.ok && campaignAnalytics.ok) {
        const userData = await userAnalytics.json();
        const campaignData = await campaignAnalytics.json();
        
        setDashboardStats({
          totalUsers: userData.total_users || 0,
          activeCampaigns: campaignData.active_campaigns || 0,
          securityThreats: Math.floor(Math.random() * 50), // Mock for now
          revenue: Math.floor(Math.random() * 50000) // Mock for now
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      let endpoint = `/api/admin/users/${userId}/${action}`;
      let method = 'POST';
      let body = null;

      // Handle different actions
      switch (action) {
        case 'change-password':
          const newPassword = prompt('Enter new password for user:');
          if (!newPassword) return;
          endpoint = `/api/admin/users/${userId}/change-password`;
          body = JSON.stringify({ new_password: newPassword });
          break;
        case 'extend':
          const days = prompt('Enter number of days to extend subscription:');
          if (!days || isNaN(days)) return;
          endpoint = `/api/admin/users/${userId}/extend`;
          body = JSON.stringify({ days: parseInt(days) });
          break;
        case 'delete':
          if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
          method = 'DELETE';
          endpoint = `/api/admin/users/${userId}`;
          break;
        case 'approve':
        case 'suspend':
        case 'view':
          // These use the default endpoint structure
          break;
        default:
          console.error('Unknown action:', action);
          return;
      }
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: body
      });
      
      if (response.ok) {
        if (action === 'view') {
          const userData = await response.json();
          alert(`User Details:\nID: ${userData.id}\nUsername: ${userData.username}\nEmail: ${userData.email}\nRole: ${userData.role}\nStatus: ${userData.status}`);
        } else {
          fetchUsers(); // Refresh the user list
          alert(`Successfully ${action === 'change-password' ? 'changed password for' : action === 'extend' ? 'extended subscription for' : action + 'd'} user.`);
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to ${action} user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error);
      alert(`Error performing ${action} on user. Please try again.`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-600', text: 'Active', icon: CheckCircle },
      pending: { color: 'bg-yellow-600', text: 'Pending', icon: Clock },
      suspended: { color: 'bg-red-600', text: 'Suspended', icon: Ban },
      expired: { color: 'bg-gray-600', text: 'Expired', icon: UserX }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      main_admin: { color: 'bg-purple-600', text: 'Main Admin', icon: Crown },
      admin: { color: 'bg-blue-600', text: 'Admin', icon: UserCheck },
      member: { color: 'bg-gray-600', text: 'Member', icon: User }
    };
    
    const config = roleConfig[role] || roleConfig.member;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const calculateRemainingDays = (endDate) => {
    if (!endDate) return 'N/A';
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, campaigns, security, and system settings</p>
            <p className="text-muted-foreground text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={fetchUsers}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="user-management" className="space-y-6">
        <TabsList className="bg-card border-border grid grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="user-management" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="campaign-management" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target className="h-4 w-4 mr-2" />
            Campaign Management
          </TabsTrigger>
          <TabsTrigger value="security-threats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="h-4 w-4 mr-2" />
            Security & Threats
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="support-tickets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="audit-logs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{dashboardStats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{dashboardStats.activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Security Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{dashboardStats.securityThreats}</div>
                <p className="text-xs text-muted-foreground">-8% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">${dashboardStats.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-management" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-input border-border text-foreground">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48 bg-input border-border text-foreground">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="main_admin">Main Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* 6 Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">{users.length}</div>
                <p className="text-xs text-muted-foreground">+{Math.floor(users.length * 0.1)} this month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{users.filter(u => u.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">Live count</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{users.filter(u => u.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">{users.filter(u => u.role === 'admin' || u.role === 'main_admin').length}</div>
                <p className="text-xs text-muted-foreground">Admin accounts</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-500">{users.filter(u => u.role === 'member').length}</div>
                <p className="text-xs text-muted-foreground">Regular users</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{Math.floor(users.filter(u => u.status === 'active').length * 0.3)}</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">User Growth Trends</CardTitle>
                <CardDescription>User registrations over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { date: '2025-08-06', registrations: 12, active: 145 },
                      { date: '2025-08-07', registrations: 19, active: 152 },
                      { date: '2025-08-08', registrations: 15, active: 158 },
                      { date: '2025-08-09', registrations: 22, active: 167 },
                      { date: '2025-08-10', registrations: 18, active: 172 },
                      { date: '2025-08-11', registrations: 25, active: 181 },
                      { date: '2025-08-12', registrations: 20, active: 186 },
                      { date: '2025-08-13', registrations: 28, active: 195 },
                      { date: '2025-08-14', registrations: 24, active: 203 },
                      { date: '2025-08-15', registrations: 31, active: 212 },
                      { date: '2025-08-16', registrations: 27, active: 218 },
                      { date: '2025-08-17', registrations: 33, active: 227 },
                      { date: '2025-08-18', registrations: 29, active: 234 },
                      { date: '2025-08-19', registrations: 35, active: 243 },
                      { date: '2025-08-20', registrations: 32, active: 251 },
                      { date: '2025-08-21', registrations: 38, active: 260 },
                      { date: '2025-08-22', registrations: 34, active: 267 },
                      { date: '2025-08-23', registrations: 40, active: 276 },
                      { date: '2025-08-24', registrations: 36, active: 283 },
                      { date: '2025-08-25', registrations: 42, active: 292 },
                      { date: '2025-08-26', registrations: 39, active: 299 },
                      { date: '2025-08-27', registrations: 45, active: 308 },
                      { date: '2025-08-28', registrations: 41, active: 315 },
                      { date: '2025-08-29', registrations: 47, active: 324 },
                      { date: '2025-08-30', registrations: 44, active: 331 },
                      { date: '2025-08-31', registrations: 50, active: 340 },
                      { date: '2025-09-01', registrations: 46, active: 347 },
                      { date: '2025-09-02', registrations: 52, active: 356 },
                      { date: '2025-09-03', registrations: 49, active: 363 },
                      { date: '2025-09-04', registrations: 55, active: 372 },
                      { date: '2025-09-05', registrations: 51, active: 379 }
                    ]}>
                      <defs>
                        <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="registrations" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#registrationGradient)" 
                        name="New Registrations"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">User Role Distribution</CardTitle>
                <CardDescription>Breakdown of user roles in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Members', value: users.filter(u => u.role === 'member').length, fill: '#3B82F6' },
                          { name: 'Admins', value: users.filter(u => u.role === 'admin').length, fill: '#8B5CF6' },
                          { name: 'Main Admin', value: users.filter(u => u.role === 'main_admin').length, fill: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                User Management
                <Badge variant="outline" className="border-primary text-primary">
                  {filteredUsers.length} users
                </Badge>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Comprehensive user management with detailed subscription and activity information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No users found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">USER ID</TableHead>
                        <TableHead className="text-muted-foreground">USERNAME</TableHead>
                        <TableHead className="text-muted-foreground">EMAIL</TableHead>
                        <TableHead className="text-muted-foreground">ROLE</TableHead>
                        <TableHead className="text-muted-foreground">STATUS</TableHead>
                        <TableHead className="text-muted-foreground">SUBSCRIPTION PLAN</TableHead>
                        <TableHead className="text-muted-foreground">SUBSCRIPTION START</TableHead>
                        <TableHead className="text-muted-foreground">SUBSCRIPTION END</TableHead>
                        <TableHead className="text-muted-foreground">REMAINING DAYS</TableHead>
                        <TableHead className="text-muted-foreground">CAMPAIGNS ASSIGNED</TableHead>
                        <TableHead className="text-muted-foreground">LAST LOGIN</TableHead>
                        <TableHead className="text-muted-foreground">CREATED AT</TableHead>
                        <TableHead className="text-muted-foreground">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, index) => (
                        <TableRow key={user.id || index} className="border-border hover:bg-accent/50">
                          <TableCell className="text-foreground">
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              U{user.id || index + 1}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{user.username || 'N/A'}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{user.email || 'N/A'}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          
                          <TableCell>{getStatusBadge(user.status || 'pending')}</TableCell>
                          
                        <TableCell>
                          <Badge variant="outline">
                            {user.subscription_plan || '1 Day Trial'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(user.subscription_start)}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {user.role === 'main_admin' || user.role === 'admin' ? 'Lifetime' : formatDate(user.subscription_end)}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-foreground">
                          <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                            {user.remaining_days === 'Lifetime' ? 'Lifetime' : `${user.remaining_days || 0} days`}
                          </Badge>
                        </TableCell>
                          
                          <TableCell className="text-foreground">
                            <span className="text-blue-400 cursor-pointer hover:underline">
                              {user.campaigns_count || 0}
                            </span>
                          </TableCell>
                          
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDateTime(user.last_login)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(user.created_at)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleChangeUserRole(user.id)}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetUserPassword(user.id)}>
                                  <Key className="h-4 w-4 mr-2" />
                                  Reset Password
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
        </TabsContent>

        <TabsContent value="campaign-management" className="space-y-6">
          <CampaignManagement />
        </TabsContent>

               <TabsContent value="security-threats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Threats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">247</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Blocked IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">89</div>
                <p className="text-xs text-muted-foreground">+5% from last week</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bot Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">1,234</div>
                <p className="text-xs text-muted-foreground">-8% from last week</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">94%</div>
                <p className="text-xs text-muted-foreground">+2% from last week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Threat Trends</CardTitle>
                <CardDescription>Security threats over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { date: '2025-08-06', threats: 12, bots: 8, suspicious: 4 },
                      { date: '2025-08-07', threats: 19, bots: 12, suspicious: 7 },
                      { date: '2025-08-08', threats: 15, bots: 9, suspicious: 6 },
                      { date: '2025-08-09', threats: 22, bots: 15, suspicious: 7 },
                      { date: '2025-08-10', threats: 18, bots: 11, suspicious: 7 },
                      { date: '2025-08-11', threats: 25, bots: 17, suspicious: 8 },
                      { date: '2025-08-12', threats: 20, bots: 13, suspicious: 7 },
                      { date: '2025-08-13', threats: 28, bots: 19, suspicious: 9 },
                      { date: '2025-08-14', threats: 24, bots: 16, suspicious: 8 },
                      { date: '2025-08-15', threats: 31, bots: 21, suspicious: 10 },
                      { date: '2025-08-16', threats: 27, bots: 18, suspicious: 9 },
                      { date: '2025-08-17', threats: 33, bots: 23, suspicious: 10 },
                      { date: '2025-08-18', threats: 29, bots: 20, suspicious: 9 },
                      { date: '2025-08-19', threats: 35, bots: 24, suspicious: 11 },
                      { date: '2025-08-20', threats: 32, bots: 22, suspicious: 10 },
                      { date: '2025-08-21', threats: 38, bots: 26, suspicious: 12 },
                      { date: '2025-08-22', threats: 34, bots: 23, suspicious: 11 },
                      { date: '2025-08-23', threats: 40, bots: 28, suspicious: 12 },
                      { date: '2025-08-24', threats: 36, bots: 25, suspicious: 11 },
                      { date: '2025-08-25', threats: 42, bots: 29, suspicious: 13 },
                      { date: '2025-08-26', threats: 39, bots: 27, suspicious: 12 },
                      { date: '2025-08-27', threats: 45, bots: 31, suspicious: 14 },
                      { date: '2025-08-28', threats: 41, bots: 28, suspicious: 13 },
                      { date: '2025-08-29', threats: 47, bots: 33, suspicious: 14 },
                      { date: '2025-08-30', threats: 44, bots: 30, suspicious: 14 },
                      { date: '2025-08-31', threats: 50, bots: 35, suspicious: 15 },
                      { date: '2025-09-01', threats: 46, bots: 32, suspicious: 14 },
                      { date: '2025-09-02', threats: 52, bots: 36, suspicious: 16 },
                      { date: '2025-09-03', threats: 49, bots: 34, suspicious: 15 },
                      { date: '2025-09-04', threats: 55, bots: 38, suspicious: 17 },
                      { date: '2025-09-05', threats: 51, bots: 35, suspicious: 16 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="threats" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                        name="Total Threats"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bots" 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                        name="Bot Attempts"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="suspicious" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        name="Suspicious Activity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Threat Distribution</CardTitle>
                <CardDescription>Types of security threats detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Bot Attempts', value: 45, fill: '#F59E0B' },
                          { name: 'Suspicious IPs', value: 25, fill: '#EF4444' },
                          { name: 'Rate Limiting', value: 15, fill: '#8B5CF6' },
                          { name: 'Geo Blocking', value: 10, fill: '#10B981' },
                          { name: 'VPN Detection', value: 5, fill: '#3B82F6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Geographic Threat Map</CardTitle>
                <CardDescription>Top threat sources by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { country: 'China', threats: 89, blocked: 67 },
                      { country: 'Russia', threats: 76, blocked: 58 },
                      { country: 'USA', threats: 45, blocked: 23 },
                      { country: 'Brazil', threats: 34, blocked: 28 },
                      { country: 'India', threats: 29, blocked: 19 },
                      { country: 'Germany', threats: 23, blocked: 15 },
                      { country: 'France', threats: 18, blocked: 12 },
                      { country: 'UK', threats: 15, blocked: 9 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="country" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="threats" fill="#EF4444" name="Total Threats" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="blocked" fill="#10B981" name="Blocked" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Hourly Threat Activity</CardTitle>
                <CardDescription>Threat patterns throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { hour: '00:00', threats: 12 },
                      { hour: '01:00', threats: 8 },
                      { hour: '02:00', threats: 6 },
                      { hour: '03:00', threats: 4 },
                      { hour: '04:00', threats: 5 },
                      { hour: '05:00', threats: 7 },
                      { hour: '06:00', threats: 15 },
                      { hour: '07:00', threats: 23 },
                      { hour: '08:00', threats: 34 },
                      { hour: '09:00', threats: 45 },
                      { hour: '10:00', threats: 52 },
                      { hour: '11:00', threats: 48 },
                      { hour: '12:00', threats: 56 },
                      { hour: '13:00', threats: 61 },
                      { hour: '14:00', threats: 58 },
                      { hour: '15:00', threats: 63 },
                      { hour: '16:00', threats: 59 },
                      { hour: '17:00', threats: 54 },
                      { hour: '18:00', threats: 47 },
                      { hour: '19:00', threats: 39 },
                      { hour: '20:00', threats: 32 },
                      { hour: '21:00', threats: 28 },
                      { hour: '22:00', threats: 21 },
                      { hour: '23:00', threats: 16 }
                    ]}>
                      <defs>
                        <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="threats" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#threatGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Security Events</CardTitle>
                <CardDescription>Latest security incidents and actions taken</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '2 minutes ago', type: 'Bot Blocked', ip: '192.168.1.100', severity: 'high', action: 'IP Blocked' },
                    { time: '5 minutes ago', type: 'Suspicious Activity', ip: '10.0.0.50', severity: 'medium', action: 'Rate Limited' },
                    { time: '8 minutes ago', type: 'VPN Detected', ip: '172.16.0.200', severity: 'low', action: 'Logged' },
                    { time: '12 minutes ago', type: 'Bot Blocked', ip: '203.0.113.45', severity: 'high', action: 'IP Blocked' },
                    { time: '15 minutes ago', type: 'Geo Block', ip: '198.51.100.30', severity: 'medium', action: 'Country Blocked' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          event.severity === 'high' ? 'bg-red-500' : 
                          event.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-foreground">{event.type}</p>
                          <p className="text-sm text-muted-foreground">IP: {event.ip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{event.action}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

                <TabsContent value="subscriptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">$24,567</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">156</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">3.2%</div>
                <p className="text-xs text-muted-foreground">-0.5% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trial Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">67%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Revenue Trends</CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { month: 'Jan', revenue: 18500, subscriptions: 120 },
                      { month: 'Feb', revenue: 19200, subscriptions: 125 },
                      { month: 'Mar', revenue: 20100, subscriptions: 132 },
                      { month: 'Apr', revenue: 21300, subscriptions: 138 },
                      { month: 'May', revenue: 22800, subscriptions: 145 },
                      { month: 'Jun', revenue: 23400, subscriptions: 149 },
                      { month: 'Jul', revenue: 24100, subscriptions: 152 },
                      { month: 'Aug', revenue: 24567, subscriptions: 156 }
                    ]}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value, name) => [
                          name === 'revenue' ? `$${value.toLocaleString()}` : value,
                          name === 'revenue' ? 'Revenue' : 'Subscriptions'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#revenueGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Subscription Plans</CardTitle>
                <CardDescription>Distribution of subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pro Monthly', value: 45, fill: '#3B82F6' },
                          { name: 'Pro Yearly', value: 35, fill: '#10B981' },
                          { name: 'Enterprise', value: 15, fill: '#8B5CF6' },
                          { name: 'Trial', value: 5, fill: '#F59E0B' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Subscription Management</CardTitle>
              <CardDescription>Manage user subscriptions and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Search subscriptions..." className="w-64" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Plan Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="pro-monthly">Pro Monthly</SelectItem>
                        <SelectItem value="pro-yearly">Pro Yearly</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: 1,
                        user: 'john.doe@example.com',
                        plan: 'Pro Monthly',
                        status: 'active',
                        startDate: '2025-08-01',
                        endDate: '2025-09-01',
                        revenue: '$29.99'
                      },
                      {
                        id: 2,
                        user: 'jane.smith@example.com',
                        plan: 'Pro Yearly',
                        status: 'active',
                        startDate: '2025-01-15',
                        endDate: '2026-01-15',
                        revenue: '$299.99'
                      },
                      {
                        id: 3,
                        user: 'bob.wilson@example.com',
                        plan: 'Enterprise',
                        status: 'active',
                        startDate: '2025-06-01',
                        endDate: '2026-06-01',
                        revenue: '$999.99'
                      },
                      {
                        id: 4,
                        user: 'alice.brown@example.com',
                        plan: 'Trial',
                        status: 'expired',
                        startDate: '2025-08-20',
                        endDate: '2025-08-27',
                        revenue: '$0.00'
                      },
                      {
                        id: 5,
                        user: 'charlie.davis@example.com',
                        plan: 'Pro Monthly',
                        status: 'cancelled',
                        startDate: '2025-07-01',
                        endDate: '2025-08-01',
                        revenue: '$29.99'
                      }
                    ].map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{subscription.user}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            subscription.plan === 'Enterprise' ? 'default' :
                            subscription.plan.includes('Pro') ? 'secondary' : 'outline'
                          }>
                            {subscription.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            subscription.status === 'active' ? 'default' :
                            subscription.status === 'expired' ? 'destructive' : 'secondary'
                          }>
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{subscription.revenue}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Extend Subscription
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Ban className="h-4 w-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support-tickets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">23</div>
                <p className="text-xs text-muted-foreground">+3 from yesterday</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">12</div>
                <p className="text-xs text-muted-foreground">+2 from yesterday</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">2.4h</div>
                <p className="text-xs text-muted-foreground">-0.3h from yesterday</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">4.8/5</div>
                <p className="text-xs text-muted-foreground">+0.1 from last week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ticket Volume Trends</CardTitle>
                <CardDescription>Daily ticket creation and resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { date: '2025-08-29', created: 15, resolved: 12 },
                      { date: '2025-08-30', created: 18, resolved: 16 },
                      { date: '2025-08-31', created: 22, resolved: 19 },
                      { date: '2025-09-01', created: 20, resolved: 23 },
                      { date: '2025-09-02', created: 25, resolved: 21 },
                      { date: '2025-09-03', created: 19, resolved: 24 },
                      { date: '2025-09-04', created: 23, resolved: 20 },
                      { date: '2025-09-05', created: 17, resolved: 22 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="created" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        name="Created"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="resolved" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                        name="Resolved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Ticket Categories</CardTitle>
                <CardDescription>Distribution of support ticket types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Technical Issues', value: 35, fill: '#EF4444' },
                          { name: 'Account Problems', value: 25, fill: '#F59E0B' },
                          { name: 'Billing Questions', value: 20, fill: '#3B82F6' },
                          { name: 'Feature Requests', value: 15, fill: '#8B5CF6' },
                          { name: 'General Inquiries', value: 5, fill: '#10B981' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Support Tickets</CardTitle>
              <CardDescription>Manage and track customer support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Search tickets..." className="w-64" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: 'TK-001',
                        subject: 'Unable to access dashboard',
                        customer: 'john.doe@example.com',
                        category: 'Technical Issues',
                        priority: 'high',
                        status: 'open',
                        created: '2025-09-05 10:30'
                      },
                      {
                        id: 'TK-002',
                        subject: 'Billing discrepancy in invoice',
                        customer: 'jane.smith@example.com',
                        category: 'Billing Questions',
                        priority: 'medium',
                        status: 'in-progress',
                        created: '2025-09-05 09:15'
                      },
                      {
                        id: 'TK-003',
                        subject: 'Feature request: Dark mode',
                        customer: 'bob.wilson@example.com',
                        category: 'Feature Requests',
                        priority: 'low',
                        status: 'open',
                        created: '2025-09-04 16:45'
                      },
                      {
                        id: 'TK-004',
                        subject: 'Account locked after password reset',
                        customer: 'alice.brown@example.com',
                        category: 'Account Problems',
                        priority: 'urgent',
                        status: 'resolved',
                        created: '2025-09-04 14:20'
                      },
                      {
                        id: 'TK-005',
                        subject: 'General inquiry about pricing',
                        customer: 'charlie.davis@example.com',
                        category: 'General Inquiries',
                        priority: 'low',
                        status: 'closed',
                        created: '2025-09-03 11:30'
                      }
                    ].map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{ticket.subject}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{ticket.customer}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.priority === 'urgent' ? 'destructive' :
                            ticket.priority === 'high' ? 'destructive' :
                            ticket.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.status === 'open' ? 'destructive' :
                            ticket.status === 'in-progress' ? 'default' :
                            ticket.status === 'resolved' ? 'secondary' : 'outline'
                          }>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ticket.created}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">1,247</div>
                <p className="text-xs text-muted-foreground">+89 today</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">23</div>
                <p className="text-xs text-muted-foreground">+3 today</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">User Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">892</div>
                <p className="text-xs text-muted-foreground">+67 today</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">System Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">332</div>
                <p className="text-xs text-muted-foreground">+19 today</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Activity Timeline</CardTitle>
                <CardDescription>Daily audit log events over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { date: '2025-08-29', security: 18, user: 145, system: 67 },
                      { date: '2025-08-30', security: 22, user: 167, system: 72 },
                      { date: '2025-08-31', security: 15, user: 189, system: 58 },
                      { date: '2025-09-01', security: 28, user: 203, system: 81 },
                      { date: '2025-09-02', security: 19, user: 178, system: 69 },
                      { date: '2025-09-03', security: 31, user: 234, system: 94 },
                      { date: '2025-09-04', security: 25, user: 198, system: 76 },
                      { date: '2025-09-05', security: 23, user: 156, system: 63 }
                    ]}>
                      <defs>
                        <linearGradient id="securityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="systemGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="security" 
                        stackId="1"
                        stroke="#EF4444" 
                        fill="url(#securityGradient)"
                        name="Security Events"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="user" 
                        stackId="1"
                        stroke="#10B981" 
                        fill="url(#userGradient)"
                        name="User Actions"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="system" 
                        stackId="1"
                        stroke="#8B5CF6" 
                        fill="url(#systemGradient)"
                        name="System Events"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Event Categories</CardTitle>
                <CardDescription>Distribution of audit log event types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'User Login/Logout', value: 35, fill: '#10B981' },
                          { name: 'Data Access', value: 25, fill: '#3B82F6' },
                          { name: 'Security Events', value: 20, fill: '#EF4444' },
                          { name: 'System Changes', value: 15, fill: '#8B5CF6' },
                          { name: 'API Calls', value: 5, fill: '#F59E0B' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Audit Logs</CardTitle>
              <CardDescription>Comprehensive system activity and security audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Input placeholder="Search logs..." className="w-64" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Event Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="user">User Actions</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="api">API Calls</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: 1,
                        timestamp: '2025-09-05 11:45:23',
                        eventType: 'Security',
                        user: 'admin@brainlinktracker.com',
                        action: 'Failed login attempt',
                        resource: 'Authentication System',
                        ipAddress: '192.168.1.100',
                        severity: 'high'
                      },
                      {
                        id: 2,
                        timestamp: '2025-09-05 11:42:15',
                        eventType: 'User',
                        user: 'john.doe@example.com',
                        action: 'Created new campaign',
                        resource: 'Campaign: Summer Sale',
                        ipAddress: '10.0.0.45',
                        severity: 'low'
                      },
                      {
                        id: 3,
                        timestamp: '2025-09-05 11:38:07',
                        eventType: 'System',
                        user: 'system',
                        action: 'Database backup completed',
                        resource: 'Database Server',
                        ipAddress: '127.0.0.1',
                        severity: 'low'
                      },
                      {
                        id: 4,
                        timestamp: '2025-09-05 11:35:42',
                        eventType: 'User',
                        user: 'jane.smith@example.com',
                        action: 'Updated user profile',
                        resource: 'User Profile',
                        ipAddress: '203.0.113.25',
                        severity: 'low'
                      },
                      {
                        id: 5,
                        timestamp: '2025-09-05 11:32:18',
                        eventType: 'Security',
                        user: 'bob.wilson@example.com',
                        action: 'Password changed',
                        resource: 'User Account',
                        ipAddress: '198.51.100.30',
                        severity: 'medium'
                      },
                      {
                        id: 6,
                        timestamp: '2025-09-05 11:28:55',
                        eventType: 'API',
                        user: 'api_user',
                        action: 'Bulk data export',
                        resource: 'Analytics API',
                        ipAddress: '172.16.0.200',
                        severity: 'medium'
                      }
                    ].map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {log.timestamp}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            log.eventType === 'Security' ? 'destructive' :
                            log.eventType === 'User' ? 'default' :
                            log.eventType === 'System' ? 'secondary' : 'outline'
                          }>
                            {log.eventType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{log.user}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.action}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.resource}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            log.severity === 'critical' ? 'destructive' :
                            log.severity === 'high' ? 'destructive' :
                            log.severity === 'medium' ? 'default' : 'secondary'
                          }>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Export Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">General Settings</CardTitle>
                <CardDescription>Basic system configuration and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Application Name</label>
                  <Input defaultValue="Brain Link Tracker" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company Name</label>
                  <Input defaultValue="Brain Link Technologies" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Support Email</label>
                  <Input defaultValue="support@brainlinktracker.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Time Zone</label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="gmt">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Default Language</label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Save General Settings</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Security Settings</CardTitle>
                <CardDescription>Authentication and security configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Two-Factor Authentication</label>
                    <p className="text-xs text-muted-foreground">Require 2FA for all admin users</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Session Timeout</label>
                    <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15m</SelectItem>
                      <SelectItem value="30">30m</SelectItem>
                      <SelectItem value="60">1h</SelectItem>
                      <SelectItem value="120">2h</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Password Policy</label>
                    <p className="text-xs text-muted-foreground">Minimum password requirements</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">IP Whitelist</label>
                    <p className="text-xs text-muted-foreground">Restrict admin access by IP</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
                <Button className="w-full">Save Security Settings</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Email Settings</CardTitle>
                <CardDescription>SMTP configuration and email templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">SMTP Server</label>
                  <Input defaultValue="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">SMTP Port</label>
                  <Input defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Username</label>
                  <Input defaultValue="noreply@brainlinktracker.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Input type="password" defaultValue="••••••••" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Use TLS</label>
                    <p className="text-xs text-muted-foreground">Enable secure connection</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <Button className="w-full">Test Connection</Button>
                <Button className="w-full">Save Email Settings</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">API Settings</CardTitle>
                <CardDescription>External API configuration and limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Short.io API Key</label>
                  <Input defaultValue="sk_DbGGlUHPN7Z9VotL" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Short.io Domain</label>
                  <Input defaultValue="Secure-links.short.gy" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rate Limit (requests/minute)</label>
                  <Input defaultValue="1000" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">API Logging</label>
                    <p className="text-xs text-muted-foreground">Log all API requests</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">API Documentation</label>
                    <p className="text-xs text-muted-foreground">Public API docs</p>
                  </div>
                  <Button variant="outline" size="sm">View Docs</Button>
                </div>
                <Button className="w-full">Save API Settings</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Database Settings</CardTitle>
                <CardDescription>Database configuration and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Database URL</label>
                  <Input defaultValue="postgresql://neondb_owner:***@ep-odd-thunder-ade4ip4a-pooler.c-2.us-east-1.aws.neon.tech/neondb" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Connection Pool Size</label>
                    <p className="text-xs text-muted-foreground">Max concurrent connections</p>
                  </div>
                  <Input className="w-20" defaultValue="20" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Auto Backup</label>
                    <p className="text-xs text-muted-foreground">Daily database backups</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Data Retention</label>
                    <p className="text-xs text-muted-foreground">Keep logs for 90 days</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <Button className="w-full">Test Connection</Button>
                <Button className="w-full">Run Backup Now</Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Settings</CardTitle>
                <CardDescription>System alerts and notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Email Notifications</label>
                    <p className="text-xs text-muted-foreground">Send alerts via email</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Security Alerts</label>
                    <p className="text-xs text-muted-foreground">Notify on security events</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">System Health</label>
                    <p className="text-xs text-muted-foreground">Monitor system performance</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">User Activity</label>
                    <p className="text-xs text-muted-foreground">Track user actions</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <Button className="w-full">Save Notification Settings</Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">System Information</CardTitle>
              <CardDescription>Current system status and version information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Application Version</label>
                  <p className="text-lg font-semibold text-foreground">v2.1.0</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Database Version</label>
                  <p className="text-lg font-semibold text-foreground">PostgreSQL 15.3</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Server Uptime</label>
                  <p className="text-lg font-semibold text-foreground">15 days, 8 hours</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Last Backup</label>
                  <p className="text-lg font-semibold text-foreground">2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

