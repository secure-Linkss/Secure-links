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
  ResponsiveContainer,
  Cell
} from 'recharts';
import CampaignManagement from './CampaignManagement';
import UserCreationForm from './UserCreationForm';
import LinkCreationForm from './LinkCreationForm';
import CampaignCreationForm from './CampaignCreationForm';
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
  Trash2,
  Edit,
  AlertTriangle,
  TrendingUp,
  Activity,
  Globe,
  MousePointer,
  BarChart3,
  CalendarDays,
  Zap
} from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
    const [capturedEmails, setCapturedEmails] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeCampaigns: 0,
    securityThreats: 0,
    revenue: 0,
    activeUsers: 0,
    totalClicks: 0,
    capturedEmails: 0,
    conversionRate: 0
  });

  // Sample data for demonstration with complete user information
    const sampleUsers = [];

  const [auditLogs, setAuditLogs] = useState([]);

  const [subscriptions, setSubscriptions] = useState([]);

  const [securityThreats, setSecurityThreats] = useState([]);

  const [chartData, setChartData] = useState([]);

  // Modal states for forms
  const [showUserForm, setShowUserForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Use sample data for now
      const response = await fetch("/api/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      } else {
        console.error("Failed to fetch dashboard stats:", response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users:", response.statusText);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching users:', error);

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
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { color: 'bg-green-600', text: 'Low' },
      medium: { color: 'bg-yellow-600', text: 'Medium' },
      high: { color: 'bg-red-600', text: 'High' },
      critical: { color: 'bg-purple-600', text: 'Critical' }
    };
    
    const config = severityConfig[severity] || severityConfig.medium;
    return (
      <Badge className={`${config.color} text-white`}>
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

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      } else {
        console.error("Failed to fetch subscriptions:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const fetchSecurityThreats = async () => {
    try {
      const response = await fetch("/api/admin/security-threats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSecurityThreats(data);
      } else {
        console.error("Failed to fetch security threats:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching security threats:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch("/api/admin/chart-data", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        console.error("Failed to fetch chart data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch("/api/admin/audit-logs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      } else {
        console.error("Failed to fetch audit logs:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  // Form handlers
  const handleUserCreated = (newUser) => {
    setUsers(prev => [...prev, newUser]);
    setShowUserForm(false);
    fetchUsers(); // Refresh the list
  };

  const handleLinkCreated = (newLink) => {
    setShowLinkForm(false);
    // Optionally refresh links if needed
  };

  const handleCampaignCreated = (newCampaign) => {
    setShowCampaignForm(false);
    // Optionally refresh campaigns if needed
  };

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
    fetchAuditLogs();
    fetchSubscriptions();
    fetchSecurityThreats();
    fetchChartData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Form Modals */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <UserCreationForm 
              onUserCreated={handleUserCreated}
              onCancel={() => setShowUserForm(false)}
            />
          </div>
        </div>
      )}

      {showLinkForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <LinkCreationForm 
              onLinkCreated={handleLinkCreated}
              onCancel={() => setShowLinkForm(false)}
            />
          </div>
        </div>
      )}

      {showCampaignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CampaignCreationForm 
              onCampaignCreated={handleCampaignCreated}
              onCancel={() => setShowCampaignForm(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive system management and user administration
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={fetchUsers}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="user-management">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="campaign-management">
            <Target className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="security-threats">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="support-tickets">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support
          </TabsTrigger>
          <TabsTrigger value="audit-logs">
            <FileText className="h-4 w-4 mr-2" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Compact Metric Cards - 8 cards in one row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total Users</p>
                    <p className="text-xl font-bold">{dashboardStats.totalUsers}</p>
                  </div>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-green-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Active Users</p>
                    <p className="text-xl font-bold">{dashboardStats.activeUsers}</p>
                  </div>
                  <UserCheck className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Campaigns</p>
                    <p className="text-xl font-bold">{dashboardStats.activeCampaigns}</p>
                  </div>
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-red-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Threats</p>
                    <p className="text-xl font-bold">{dashboardStats.securityThreats}</p>
                  </div>
                  <Shield className="h-4 w-4 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-emerald-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Revenue</p>
                    <p className="text-xl font-bold">${dashboardStats.revenue}</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-orange-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total Clicks</p>
                    <p className="text-xl font-bold">{dashboardStats.totalClicks.toLocaleString()}</p>
                  </div>
                  <MousePointer className="h-4 w-4 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-teal-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Emails</p>
                    <p className="text-xl font-bold">{dashboardStats.capturedEmails}</p>
                  </div>
                  <Mail className="h-4 w-4 text-teal-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-sm transition-shadow cursor-pointer border-l-4 border-l-indigo-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Conversion</p>
                    <p className="text-xl font-bold">{dashboardStats.conversionRate}%</p>
                  </div>
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid - Side by Side (2 columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth Chart */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">User Growth Trends</CardTitle>
                <p className="text-xs text-muted-foreground">User registration and activity over time</p>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
                      dataKey="users"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Revenue Analytics</CardTitle>
                <p className="text-xs text-muted-foreground">Daily revenue and growth metrics</p>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
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
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Captured Emails List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Email Captures</CardTitle>
              <CardDescription>Latest email addresses captured through campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {capturedEmails.map((capture, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{capture.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {capture.campaign} • {capture.source}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatDate(capture.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-management" className="space-y-6">
          {/* User Management Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={() => setShowUserForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          {/* User Management Table with Complete Columns */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Comprehensive user account management with detailed information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscription Plan</TableHead>
                      <TableHead>Subscription Start</TableHead>
                      <TableHead>Subscription End</TableHead>
                      <TableHead>Remaining Days</TableHead>
                      <TableHead>Campaigns Assigned</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.user_id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {user.subscription_plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(user.subscription_start)}</TableCell>
                        <TableCell className="text-sm">{formatDate(user.subscription_end)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {calculateRemainingDays(user.subscription_end)} days
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" className="p-0 h-auto text-blue-600">
                            {user.campaigns_assigned} campaigns
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm">{formatDateTime(user.last_login)}</TableCell>
                        <TableCell className="text-sm">{formatDateTime(user.created_at)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'view')}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              {user.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'approve')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {user.status === 'active' ? (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'suspend')}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : user.status === 'suspended' && (
                                <DropdownMenuItem onClick={() => handleUserAction(user.id, 'approve')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'extend')}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Extend
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'delete')}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
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

        <TabsContent value="campaign-management" className="space-y-6">
          <CampaignManagement />
        </TabsContent>

        <TabsContent value="security-threats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Threats & Monitoring</CardTitle>
              <CardDescription>Monitor and manage security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Threat Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>User/IP</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleSecurityThreats.map((threat) => (
                    <TableRow key={threat.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          {threat.type}
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(threat.severity)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{threat.user}</p>
                          <p className="text-xs text-muted-foreground">{threat.ip_address}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(threat.timestamp)}</TableCell>
                      <TableCell>
                        <Badge variant={threat.status === 'blocked' ? 'destructive' : 'secondary'}>
                          {threat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>Manage user subscriptions and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">{subscription.user}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscription.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{formatDate(subscription.start_date)}</p>
                          <p className="text-xs text-muted-foreground">
                            to {formatDate(subscription.end_date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>${subscription.amount}</TableCell>
                      <TableCell>{subscription.payment_method}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support-tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Manage customer support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No support tickets at the moment</p>
                <Button className="mt-4">Create Ticket</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>System activity and user action logs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                      <TableCell>{log.ip_address}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Name</label>
                  <Input defaultValue="Secure Links" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Email</label>
                  <Input defaultValue="admin@secure-links.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Links Per User</label>
                  <Input defaultValue="100" type="number" />
                </div>
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Two-Factor Authentication</label>
                    <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Session Timeout</label>
                    <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Input className="w-20" defaultValue="30" />
                </div>
                <Button className="w-full">Update Security</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;


