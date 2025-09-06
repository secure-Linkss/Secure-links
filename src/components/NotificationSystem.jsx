import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Bell, 
  BellRing, 
  Trash2, 
  RefreshCw, 
  Check, 
  CheckCheck, 
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        // Mock data for demonstration
        setNotifications([
          {
            id: 1,
            title: 'New User Registration',
            message: 'A new user has registered: john.doe@example.com',
            type: 'info',
            read: false,
            created_at: new Date().toISOString(),
            priority: 'medium'
          },
          {
            id: 2,
            title: 'Security Alert',
            message: 'Suspicious login attempt detected from IP 192.168.1.100',
            type: 'warning',
            read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            priority: 'high'
          },
          {
            id: 3,
            title: 'Campaign Completed',
            message: 'Summer Sale Campaign has reached its target goal',
            type: 'success',
            read: true,
            created_at: new Date(Date.now() - 7200000).toISOString(),
            priority: 'low'
          },
          {
            id: 4,
            title: 'System Maintenance',
            message: 'Scheduled maintenance will begin at 2:00 AM UTC',
            type: 'info',
            read: true,
            created_at: new Date(Date.now() - 10800000).toISOString(),
            priority: 'medium'
          },
          {
            id: 5,
            title: 'Payment Failed',
            message: 'Payment processing failed for subscription renewal',
            type: 'error',
            read: false,
            created_at: new Date(Date.now() - 14400000).toISOString(),
            priority: 'high'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use mock data on error
      setNotifications([
        {
          id: 1,
          title: 'New User Registration',
          message: 'A new user has registered: john.doe@example.com',
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: 2,
          title: 'Security Alert',
          message: 'Suspicious login attempt detected from IP 192.168.1.100',
          type: 'warning',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          priority: 'high'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Update locally even if API fails
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    }
  };

  // Mark notification as unread
  const markAsUnread = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/unread`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: false }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      // Update locally even if API fails
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: false }
            : notif
        )
      );
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Delete locally even if API fails
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Update locally even if API fails
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6">
      {/* Notification Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread of {notifications.length} total
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="border-border text-foreground hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="border-border text-foreground hover:bg-accent"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'unread', 'read'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterType)}
            className={filter === filterType ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            {filterType === 'unread' && unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'read' ? 'No read notifications' : 'No notifications found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`bg-card border-border transition-all hover:shadow-sm ${
                !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {notification.title}
                        </h4>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {notification.read ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsUnread(notification.id)}
                        className="h-8 w-8 p-0 hover:bg-accent"
                        title="Mark as unread"
                      >
                        <BellRing className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 p-0 hover:bg-accent"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationSystem;

