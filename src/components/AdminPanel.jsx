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
  RefreshCw
} from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

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
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh the user list
      } else {
        console.error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error);
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
        <TabsList className="bg-card border-border">
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
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

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
                          
                          <TableCell className="text-foreground">
                            <span className="text-sm">{user.subscription_plan || '1 Day Trial'}</span>
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
                              <span className="text-sm">{formatDate(user.subscription_end)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-foreground">
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                              {calculateRemainingDays(user.subscription_end)} days
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
                          
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUserAction(user.id, 'view')}
                                className="h-8 w-8 p-0"
                                title="View User"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              
                              {user.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleUserAction(user.id, 'approve')}
                                  className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
                                  title="Approve User"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {user.status !== 'suspended' && user.role !== 'main_admin' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleUserAction(user.id, 'suspend')}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                  title="Suspend User"
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                              )}

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-popover border-border">
                                  <DropdownMenuItem className="text-foreground hover:bg-accent">
                                    <Clock className="h-3 w-3 mr-2" />
                                    Extend Subscription
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-400 hover:bg-accent">
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Campaign Management</h3>
              <p className="text-muted-foreground">Campaign management features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-threats" className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Security & Threats</h3>
              <p className="text-muted-foreground">Security monitoring and threat detection features will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">System Settings</h3>
              <p className="text-muted-foreground">System configuration and settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

