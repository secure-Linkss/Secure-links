import { useState } from 'react'
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
  User,
  MessageSquare,
  Users
} from 'lucide-react'
import Logo from './Logo'

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications] = useState(12) // Mock notification count

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tracking-links', icon: Link2, label: 'Tracking Links' },
    { path: '/live-activity', icon: Activity, label: 'Live Activity' },
    { path: '/campaign', icon: Target, label: 'Campaign' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/geography', icon: Globe, label: 'Geography' },
    { path: '/security', icon: Shield, label: 'Security' },
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/link-shortener', icon: Scissors, label: 'Link Shortener' },
    { path: '/chat', icon: MessageSquare, label: 'Support Chat' },
    ...(user?.role === 'admin' || user?.username === 'Brain' ? [
      { path: '/admin-panel', icon: Users, label: 'Admin Panel' },
      { path: '/admin-chat', icon: MessageSquare, label: 'Admin Chat' },
    ] : []),
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
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="relative">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                  </Button>
                  {notifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {notifications}
                    </Badge>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 w-80">
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-slate-300 text-sm">New click detected on campaign "Summer Sale"</p>
                      <p className="text-slate-500 text-xs mt-1">2 minutes ago</p>
                    </div>
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-slate-300 text-sm">Bot attempt blocked on tracking link</p>
                      <p className="text-slate-500 text-xs mt-1">5 minutes ago</p>
                    </div>
                    <div className="p-3 bg-slate-700 rounded-lg">
                      <p className="text-slate-300 text-sm">Campaign "Winter Promotion" reached 100 clicks</p>
                      <p className="text-slate-500 text-xs mt-1">1 hour ago</p>
                    </div>
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

