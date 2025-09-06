import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Link2,
  Activity,
  Target,
  BarChart3,
  Globe,
  Shield,
  Settings,
  Scissors,
  Bell,
  LogOut,
  User
} from 'lucide-react'
import Logo from './Logo'

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setNotificationCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: 1 },
    { path: '/tracking-links', icon: Link2, label: 'Tracking Links', badge: 2 },
    { path: '/live-activity', icon: Activity, label: 'Live Activity', badge: 3 },
    { path: '/campaign', icon: Target, label: 'Campaign', badge: 4 },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', badge: 5 },
    { path: '/geography', icon: Globe, label: 'Geography', badge: 6 },
    { path: '/security', icon: Shield, label: 'Security', badge: 7 },
    { path: '/settings', icon: Settings, label: 'Settings', badge: 8 },
    { path: '/link-shortener', icon: Scissors, label: 'Link Shortener', badge: 9 },
    { path: '/notifications', icon: Bell, label: 'Notifications', badge: 11, notificationCount: true },
    { path: '/admin-panel', icon: User, label: 'Admin Panel', badge: 10, adminOnly: true },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Logo size="md" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            if (item.adminOnly && (!user || (user.role !== "admin" && user.role !== "main_admin"))) {
              return null;
            }
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                <Badge 
                  variant={active ? "secondary" : "outline"}
                  className={`text-xs ${
                    active 
                      ? 'bg-white text-blue-600' 
                      : 'border-slate-600 text-slate-400'
                  }`}
                >
                  {item.notificationCount && notificationCount > 0 ? notificationCount : item.badge}
                </Badge>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-blue-500 text-blue-400 bg-slate-700">
              <User className="h-3 w-3 mr-1" />
              A1
            </Badge>
            {user && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  user.role === 'main_admin' 
                    ? 'border-purple-500 text-purple-400 bg-purple-900/20' 
                    : user.role === 'admin'
                    ? 'border-blue-500 text-blue-400 bg-blue-900/20'
                    : 'border-gray-500 text-gray-400 bg-gray-900/20'
                }`}
              >
                {user.role === 'main_admin' ? 'Main Admin' : 
                 user.role === 'admin' ? 'Admin' : 'Member'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                  </Button>
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {notificationCount}
                    </Badge>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-80">
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-3">Notifications</h3>
                  <div className="space-y-3">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 3).map((notification, index) => (
                        <div key={notification.id || index} className="p-3 bg-slate-700 rounded-lg">
                          <p className="text-slate-300 text-sm">{notification.message}</p>
                          <p className="text-slate-500 text-xs mt-1">{notification.timeAgo}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-700 rounded-lg">
                        <p className="text-slate-300 text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" className="w-full mt-3 text-blue-400 hover:text-blue-300">
                    View All Notifications
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-slate-400 hover:text-white">
                  <Avatar className="h-8 w-8 bg-blue-600">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">admin@brainlinktracker.com</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem 
                  onClick={onLogout}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

