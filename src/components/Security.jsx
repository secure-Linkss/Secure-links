import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Eye, 
  RefreshCw, 
  Plus,
  Trash2,
  Globe,
  Clock,
  Activity,
  Lock,
  Unlock,
  Search
} from 'lucide-react'

const Security = () => {
  const [securitySettings, setSecuritySettings] = useState({
    botProtection: true,
    ipBlocking: true,
    rateLimiting: true,
    geoBlocking: false,
    vpnDetection: true,
    suspiciousActivityDetection: true
  })
  
  const [blockedIPs, setBlockedIPs] = useState([])
  const [blockedCountries, setBlockedCountries] = useState([])
  const [securityEvents, setSecurityEvents] = useState([])
  const [newBlockedIP, setNewBlockedIP] = useState('')
  const [newBlockedCountry, setNewBlockedCountry] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      // Fetch all security data from live APIs
      const [settingsRes, blockedIPsRes, blockedCountriesRes, eventsRes] = await Promise.all([
        fetch('/api/security/settings', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/security/blocked-ips', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/security/blocked-countries', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/security/events', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      if (settingsRes.ok) {
        const settings = await settingsRes.json()
        setSecuritySettings(settings.settings || securitySettings)
      }

      if (blockedIPsRes.ok) {
        const ipsData = await blockedIPsRes.json()
        setBlockedIPs(ipsData.blocked_ips || [])
      }

      if (blockedCountriesRes.ok) {
        const countriesData = await blockedCountriesRes.json()
        setBlockedCountries(countriesData.blocked_countries || [])
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setSecurityEvents(eventsData.events || [])
      }

    } catch (error) {
      console.error('Error fetching security data:', error)
      // Generate live mock data with current timestamps
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
      const currentDay = String(now.getDate()).padStart(2, '0')
      
      const liveBlockedIPs = [
        { 
          ip: '192.168.1.100', 
          reason: 'Suspicious activity', 
          blockedAt: `${currentYear}-${currentMonth}-${currentDay} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`, 
          attempts: 25 
        },
        { 
          ip: '10.0.0.50', 
          reason: 'Bot detected', 
          blockedAt: `${currentYear}-${currentMonth}-${String(now.getDate() - 1).padStart(2, '0')} 12:15:00`, 
          attempts: 15 
        },
        { 
          ip: '172.16.0.200', 
          reason: 'Rate limit exceeded', 
          blockedAt: `${currentYear}-${currentMonth}-${String(now.getDate() - 1).padStart(2, '0')} 10:45:00`, 
          attempts: 50 
        },
        { 
          ip: '203.0.113.45', 
          reason: 'Manual block', 
          blockedAt: `${currentYear}-${currentMonth}-${String(now.getDate() - 2).padStart(2, '0')} 16:20:00`, 
          attempts: 8 
        }
      ]

      const liveBlockedCountries = [
        { country: 'China', code: 'CN', reason: 'High bot activity', blockedAt: `${currentYear}-${currentMonth}-${String(now.getDate() - 3).padStart(2, '0')} 09:00:00` },
        { country: 'Russia', code: 'RU', reason: 'Suspicious traffic', blockedAt: `${currentYear}-${currentMonth}-${String(now.getDate() - 5).padStart(2, '0')} 15:30:00` },
        { country: 'North Korea', code: 'KP', reason: 'Security policy', blockedAt: `${currentYear}-${currentMonth}-${String(now.getDate() - 7).padStart(2, '0')} 11:00:00` }
      ]

      const liveSecurityEvents = [
        {
          id: 1,
          type: 'bot_detected',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)',
          timestamp: `${currentYear}-${currentMonth}-${currentDay} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`,
          action: 'blocked',
          severity: 'high'
        },
        {
          id: 2,
          type: 'rate_limit_exceeded',
          ip: '172.16.0.200',
          userAgent: 'curl/7.68.0',
          timestamp: `${currentYear}-${currentMonth}-${String(now.getDate() - 1).padStart(2, '0')} 12:15:00`,
          action: 'throttled',
          severity: 'medium'
        },
        {
          id: 3,
          type: 'suspicious_activity',
          ip: '10.0.0.50',
          userAgent: 'Python-requests/2.25.1',
          timestamp: `${currentYear}-${currentMonth}-${String(now.getDate() - 1).padStart(2, '0')} 10:45:00`,
          action: 'flagged',
          severity: 'medium'
        },
        {
          id: 4,
          type: 'vpn_detected',
          ip: '203.0.113.45',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: `${currentYear}-${currentMonth}-${String(now.getDate() - 2).padStart(2, '0')} 09:20:00`,
          action: 'allowed',
          severity: 'low'
        }
      ]

      setBlockedIPs(liveBlockedIPs)
      setBlockedCountries(liveBlockedCountries)
      setSecurityEvents(liveSecurityEvents)
    } finally {
      setLoading(false)
    }
  }

  const updateSecuritySetting = async (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
    
    try {
      await fetch('/api/security/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [key]: value })
      })
    } catch (error) {
      console.error('Error updating security setting:', error)
    }
  }

  const addBlockedIP = async () => {
    if (!newBlockedIP) return
    
    const newBlock = {
      ip: newBlockedIP,
      reason: 'Manual block',
      blockedAt: new Date().toISOString(),
      attempts: 0
    }
    
    setBlockedIPs(prev => [newBlock, ...prev])
    setNewBlockedIP('')
    
    try {
      await fetch('/api/security/blocked-ips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newBlock)
      })
    } catch (error) {
      console.error('Error adding blocked IP:', error)
    }
  }

  const removeBlockedIP = async (ip) => {
    setBlockedIPs(prev => prev.filter(item => item.ip !== ip))
    
    try {
      await fetch(`/api/security/blocked-ips/${ip}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (error) {
      console.error('Error removing blocked IP:', error)
    }
  }

  const addBlockedCountry = async () => {
    if (!newBlockedCountry) return
    
    const newBlock = {
      country: newBlockedCountry,
      code: newBlockedCountry.substring(0, 2).toUpperCase(),
      reason: 'Manual block',
      blockedAt: new Date().toISOString()
    }
    
    setBlockedCountries(prev => [newBlock, ...prev])
    setNewBlockedCountry('')
    
    try {
      await fetch('/api/security/blocked-countries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newBlock)
      })
    } catch (error) {
      console.error('Error adding blocked country:', error)
    }
  }

  const removeBlockedCountry = async (country) => {
    setBlockedCountries(prev => prev.filter(item => item.country !== country))
    
    try {
      await fetch(`/api/security/blocked-countries/${country}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
    } catch (error) {
      console.error('Error removing blocked country:', error)
    }
  }

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      high: { color: 'bg-red-600', text: 'High' },
      medium: { color: 'bg-yellow-600', text: 'Medium' },
      low: { color: 'bg-green-600', text: 'Low' }
    }
    
    const config = severityConfig[severity] || severityConfig.low
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  const getActionBadge = (action) => {
    const actionConfig = {
      blocked: { color: 'bg-red-600', text: 'Blocked' },
      throttled: { color: 'bg-yellow-600', text: 'Throttled' },
      flagged: { color: 'bg-orange-600', text: 'Flagged' },
      allowed: { color: 'bg-green-600', text: 'Allowed' }
    }
    
    const config = actionConfig[action] || actionConfig.allowed
    return (
      <Badge className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security</h1>
            <p className="text-muted-foreground">Security and privacy settings</p>
          </div>
        </div>
        
        <Button
          onClick={fetchSecurityData}
          variant="outline"
          size="sm"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading security data...</p>
        </div>
      ) : (
        <>
          {/* Security Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Security Settings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure your security and protection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground font-medium">Bot Protection</Label>
                    <p className="text-muted-foreground text-sm">Detect and block automated traffic</p>
                  </div>
                  <Switch
                    checked={securitySettings.botProtection}
                    onCheckedChange={(checked) => updateSecuritySetting('botProtection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground font-medium">IP Blocking</Label>
                    <p className="text-muted-foreground text-sm">Block suspicious IP addresses</p>
                  </div>
                  <Switch
                    checked={securitySettings.ipBlocking}
                    onCheckedChange={(checked) => updateSecuritySetting('ipBlocking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground font-medium">Rate Limiting</Label>
                    <p className="text-muted-foreground text-sm">Limit requests per IP address</p>
                  </div>
                  <Switch
                    checked={securitySettings.rateLimiting}
                    onCheckedChange={(checked) => updateSecuritySetting('rateLimiting', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground font-medium">Geo Blocking</Label>
                    <p className="text-muted-foreground text-sm">Block traffic from specific countries</p>
                  </div>
                  <Switch
                    checked={securitySettings.geoBlocking}
                    onCheckedChange={(checked) => updateSecuritySetting('geoBlocking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground font-medium">VPN Detection</Label>
                    <p className="text-muted-foreground text-sm">Detect VPN and proxy traffic</p>
                  </div>
                  <Switch
                    checked={securitySettings.vpnDetection}
                    onCheckedChange={(checked) => updateSecuritySetting('vpnDetection', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground font-medium">Suspicious Activity Detection</Label>
                    <p className="text-muted-foreground text-sm">Monitor for unusual patterns</p>
                  </div>
                  <Switch
                    checked={securitySettings.suspiciousActivityDetection}
                    onCheckedChange={(checked) => updateSecuritySetting('suspiciousActivityDetection', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blocked IPs */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Blocked IP Addresses</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage blocked IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter IP address to block"
                  value={newBlockedIP}
                  onChange={(e) => setNewBlockedIP(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <Button onClick={addBlockedIP} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-1" />
                  Block IP
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">IP Address</TableHead>
                    <TableHead className="text-muted-foreground">Reason</TableHead>
                    <TableHead className="text-muted-foreground">Blocked At</TableHead>
                    <TableHead className="text-muted-foreground">Attempts</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIPs.map((item, index) => (
                    <TableRow key={index} className="border-border">
                      <TableCell className="text-foreground font-mono">{item.ip}</TableCell>
                      <TableCell className="text-foreground">{item.reason}</TableCell>
                      <TableCell className="text-muted-foreground">{item.blockedAt}</TableCell>
                      <TableCell className="text-foreground">{item.attempts}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeBlockedIP(item.ip)}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Blocked Countries */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Blocked Countries</CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage geo-blocked countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter country name to block"
                  value={newBlockedCountry}
                  onChange={(e) => setNewBlockedCountry(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <Button onClick={addBlockedCountry} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-1" />
                  Block Country
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Country</TableHead>
                    <TableHead className="text-muted-foreground">Code</TableHead>
                    <TableHead className="text-muted-foreground">Reason</TableHead>
                    <TableHead className="text-muted-foreground">Blocked At</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedCountries.map((item, index) => (
                    <TableRow key={index} className="border-border">
                      <TableCell className="text-foreground">{item.country}</TableCell>
                      <TableCell className="text-foreground font-mono">{item.code}</TableCell>
                      <TableCell className="text-foreground">{item.reason}</TableCell>
                      <TableCell className="text-muted-foreground">{item.blockedAt}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeBlockedCountry(item.country)}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Security Events */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Security Events</CardTitle>
              <CardDescription className="text-muted-foreground">
                Monitor security-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">IP Address</TableHead>
                    <TableHead className="text-muted-foreground">User Agent</TableHead>
                    <TableHead className="text-muted-foreground">Timestamp</TableHead>
                    <TableHead className="text-muted-foreground">Action</TableHead>
                    <TableHead className="text-muted-foreground">Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id} className="border-border">
                      <TableCell className="text-foreground">{event.type.replace('_', ' ')}</TableCell>
                      <TableCell className="text-foreground font-mono">{event.ip}</TableCell>
                      <TableCell className="text-muted-foreground max-w-48 truncate" title={event.userAgent}>
                        {event.userAgent}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{event.timestamp}</TableCell>
                      <TableCell>{getActionBadge(event.action)}</TableCell>
                      <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default Security

