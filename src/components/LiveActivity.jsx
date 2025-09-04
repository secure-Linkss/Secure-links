import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Activity, 
  RefreshCw, 
  Search, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet,
  Globe,
  Shield,
  Eye,
  MousePointer,
  Clock,
  Mail,
  Wifi,
  ExternalLink,
  Copy,
  Trash2
} from 'lucide-react'

const LiveActivity = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchEvents()
    
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchEvents, 5000) // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch events')
        // Fallback to empty array instead of mock data
        setEvents([])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      // Fallback to empty array instead of mock data
      setEvents([])
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }


  const getStatusBadge = (status) => {
    const statusConfig = {
      'Open': { color: 'bg-blue-600', text: 'Open', icon: Eye },
      'Redirected': { color: 'bg-yellow-600', text: 'Redirected', icon: MousePointer },
      'On Page': { color: 'bg-green-600', text: 'On Page', icon: Globe },
      'Blocked': { color: 'bg-red-600', text: 'Blocked', icon: Shield },
      'Bot': { color: 'bg-purple-600', text: 'Bot', icon: Shield }
    }
    
    const config = statusConfig[status] || statusConfig['Open']
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getDeviceIcon = (device) => {
    switch (device?.toLowerCase()) {
      case 'iphone':
      case 'android':
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-green-400" />
      case 'tablet':
      case 'ipad':
        return <Tablet className="h-4 w-4 text-blue-400" />
      default:
        return <Monitor className="h-4 w-4 text-muted-foreground" />
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (response.ok) {
          setEvents(events.filter(event => event.id !== eventId))
        } else {
          console.error('Failed to delete event')
        }
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.emailCaptured?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.isp?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (eventFilter === 'all') return matchesSearch
    return matchesSearch && event.status === eventFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Activity</h1>
            <p className="text-muted-foreground">Real-time tracking events and user interactions</p>
            <p className="text-muted-foreground text-sm">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <Label htmlFor="auto-refresh" className="text-foreground">Auto-refresh</Label>
          </div>
          
          <Button
            onClick={fetchEvents}
            variant="outline"
            size="sm"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by unique ID, IP, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground"
          />
        </div>
        
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-48 bg-input border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Redirected">Redirected</SelectItem>
            <SelectItem value="On Page">On Page</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
            <SelectItem value="Bot">Bots</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            Advanced Live Tracking Events
            <Badge variant="outline" className="border-primary text-primary">
              {filteredEvents.length} events
            </Badge>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Comprehensive real-time tracking with detailed user information and email capture
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No tracking events found. Create a tracking link to start collecting data.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">TIMESTAMP</TableHead>
                    <TableHead className="text-muted-foreground">UNIQUE ID</TableHead>
                    <TableHead className="text-muted-foreground">IP ADDRESS</TableHead>
                    <TableHead className="text-muted-foreground">LOCATION</TableHead>
                    <TableHead className="text-muted-foreground">STATUS</TableHead>
                    <TableHead className="text-muted-foreground">USER AGENT</TableHead>
                    <TableHead className="text-muted-foreground">ISP</TableHead>
                    <TableHead className="text-muted-foreground">EMAIL CAPTURED</TableHead>
                    <TableHead className="text-muted-foreground">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} className="border-border hover:bg-accent/50">
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{event.timestamp}</div>
                            <div className="text-xs text-muted-foreground">
                              Session: {event.sessionDuration}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-foreground">
                        <div className="space-y-1">
                          <code className="bg-muted px-2 py-1 rounded text-xs block">
                            {event.uniqueId}
                          </code>
                          <div className="text-xs text-muted-foreground">
                            Link: {event.linkId}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-400" />
                          <div>
                            <div className="font-mono text-sm">{event.ip}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getDeviceIcon(event.device)}
                              <span>{event.device}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-400" />
                          <div className="text-sm">
                            <div className="font-medium">{event.city}, {event.region}</div>
                            <div className="text-xs text-muted-foreground">
                              {event.zipCode}, {event.country}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          {getStatusBadge(event.status)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-foreground">
                        <div className="text-sm max-w-48">
                          <div className="font-medium">{event.browser}</div>
                          <div className="text-xs text-muted-foreground truncate" title={event.userAgent}>
                            {event.os}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-purple-400" />
                          <div className="text-sm max-w-24 truncate">
                            <div className="font-medium truncate">{event.isp}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-foreground">
                        {event.emailCaptured ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-400" />
                            <div className="text-sm">
                              <div className="font-medium text-green-400">{event.emailCaptured}</div>
                              {event.conversionValue > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Value: ${event.conversionValue}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No email captured</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(event.uniqueId)}
                            className="h-8 w-8 p-0"
                            title="Copy ID"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="View Details"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteEvent(event.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            title="Delete Event"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
    </div>
  )
}

export default LiveActivity

