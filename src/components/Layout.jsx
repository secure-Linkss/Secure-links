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
  User
} from 'lucide-react'
import Logo from './Logo'

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications] = useState(12) // Mock notification count

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
                <Badge 
                  variant={active ? "secondary" : "outline"}
                  className={`text-xs ${
                    active 
                      ? 'bg-white text-blue-600' 
                      : 'border-slate-600 text-slate-400'
                  }`}
                >
                  {item.badge}
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
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
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

