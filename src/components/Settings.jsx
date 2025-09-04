import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const Settings = () => {
  const { currentTheme, themes, changeTheme } = useTheme()
  const [settings, setSettings] = useState({
    telegram: {
      enabled: false,
      botToken: '',
      chatId: '',
      notifications: {
        newClick: true,
        emailCaptured: true,
        botDetected: true,
        geoBlocked: true
      }
    },
    appearance: {
      theme: 'dark'
    },
    security: {
      ipBlocking: false,
      botProtection: true,
      rateLimiting: true,
      allowedDomains: []
    },
    database: {
      retentionDays: 90,
      autoCleanup: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [showBotToken, setShowBotToken] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    setSaveStatus(null)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const testTelegramConnection = async () => {
    if (!settings.telegram.botToken || !settings.telegram.chatId) {
      setConnectionStatus('error')
      return
    }

    setTestingConnection(true)
    setConnectionStatus(null)
    
    try {
      const response = await fetch('/api/settings/test-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          botToken: settings.telegram.botToken,
          chatId: settings.telegram.chatId
        })
      })
      
      if (response.ok) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
      }
    } catch (error) {
      console.error('Error testing Telegram connection:', error)
      setConnectionStatus('error')
    } finally {
      setTestingConnection(false)
    }
  }

  const updateTelegramSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      telegram: {
        ...prev.telegram,
        [key]: value
      }
    }))
  }

  const updateTelegramNotification = (type, enabled) => {
    setSettings(prev => ({
      ...prev,
      telegram: {
        ...prev.telegram,
        notifications: {
          ...prev.telegram.notifications,
          [type]: enabled
        }
      }
    }))
  }

  const updateSecuritySetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }))
  }

  const updateDatabaseSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      database: {
        ...prev.database,
        [key]: value
      }
    }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-8 w-8 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Configure your application preferences</p>
          </div>
        </div>
        
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <Alert className={`border ${saveStatus === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={saveStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
            {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Telegram Notifications */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white">Telegram Notifications</CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            Get real-time notifications via Telegram
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300 font-medium">Enable Telegram Notifications</Label>
              <p className="text-slate-400 text-sm">Receive alerts for tracking events</p>
            </div>
            <Switch
              checked={settings.telegram.enabled}
              onCheckedChange={(checked) => updateTelegramSetting('enabled', checked)}
            />
          </div>

          {settings.telegram.enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-slate-300">Bot Token</Label>
                <p className="text-slate-400 text-sm">Get your bot token from @BotFather on Telegram</p>
                <div className="relative">
                  <Input
                    type={showBotToken ? 'text' : 'password'}
                    value={settings.telegram.botToken}
                    onChange={(e) => updateTelegramSetting('botToken', e.target.value)}
                    placeholder="Enter your Telegram bot token"
                    className="bg-slate-700 border-slate-600 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBotToken(!showBotToken)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showBotToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Chat ID</Label>
                <p className="text-slate-400 text-sm">Send /start to your bot and get the chat ID</p>
                <Input
                  value={settings.telegram.chatId}
                  onChange={(e) => updateTelegramSetting('chatId', e.target.value)}
                  placeholder="Enter your chat ID"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={testTelegramConnection}
                  disabled={testingConnection || !settings.telegram.botToken || !settings.telegram.chatId}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
                
                {connectionStatus && (
                  <Badge 
                    variant="outline" 
                    className={`${
                      connectionStatus === 'success' 
                        ? 'border-green-500 text-green-400' 
                        : 'border-red-500 text-red-400'
                    }`}
                  >
                    {connectionStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </>
                    )}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-slate-300 font-medium">Notification Types</Label>
                
                <div className="space-y-3">
                  {[
                    { key: 'newClick', label: 'New Click', description: 'When someone clicks a tracking link' },
                    { key: 'emailCaptured', label: 'Email Captured', description: 'When an email is captured via pixel tracking' },
                    { key: 'botDetected', label: 'Bot Detected', description: 'When bot activity is detected' },
                    { key: 'geoBlocked', label: 'Geo Blocked', description: 'When access is blocked by location' }
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between">
                      <div>
                        <Label className="text-slate-300">{notification.label}</Label>
                        <p className="text-slate-400 text-sm">{notification.description}</p>
                      </div>
                      <Switch
                        checked={settings.telegram.notifications[notification.key]}
                        onCheckedChange={(checked) => updateTelegramNotification(notification.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-foreground">Appearance</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Customize the look and feel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label className="text-foreground font-medium">Theme</Label>
              <p className="text-muted-foreground text-sm mb-3">Choose your preferred color scheme</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(themes).map(([key, theme]) => (
                  <div
                    key={key}
                    onClick={() => changeTheme(key)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentTheme === key 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-foreground">{theme.name}</h3>
                      {currentTheme === key && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    
                    {/* Theme Preview */}
                    <div className="space-y-2">
                      <div 
                        className="h-8 rounded flex items-center px-3 text-xs font-medium"
                        style={{ 
                          backgroundColor: theme.colors.background,
                          color: theme.colors.foreground,
                          border: `1px solid ${theme.colors.border}`
                        }}
                      >
                        Background
                      </div>
                      <div className="flex gap-2">
                        <div 
                          className="flex-1 h-6 rounded flex items-center justify-center text-xs"
                          style={{ 
                            backgroundColor: theme.colors.primary,
                            color: theme.colors.primaryForeground
                          }}
                        >
                          Primary
                        </div>
                        <div 
                          className="flex-1 h-6 rounded flex items-center justify-center text-xs"
                          style={{ 
                            backgroundColor: theme.colors.secondary,
                            color: theme.colors.secondaryForeground
                          }}
                        >
                          Secondary
                        </div>
                        <div 
                          className="flex-1 h-6 rounded flex items-center justify-center text-xs"
                          style={{ 
                            backgroundColor: theme.colors.accent,
                            color: theme.colors.accentForeground
                          }}
                        >
                          Accent
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            <CardTitle className="text-white">Security</CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            Security and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300 font-medium">IP Blocking</Label>
              <p className="text-slate-400 text-sm">Block suspicious IP addresses</p>
            </div>
            <Switch
              checked={settings.security.ipBlocking}
              onCheckedChange={(checked) => updateSecuritySetting('ipBlocking', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300 font-medium">Bot Protection</Label>
              <p className="text-slate-400 text-sm">Detect and block automated traffic</p>
            </div>
            <Switch
              checked={settings.security.botProtection}
              onCheckedChange={(checked) => updateSecuritySetting('botProtection', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300 font-medium">Rate Limiting</Label>
              <p className="text-slate-400 text-sm">Limit requests per IP address</p>
            </div>
            <Switch
              checked={settings.security.rateLimiting}
              onCheckedChange={(checked) => updateSecuritySetting('rateLimiting', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Allowed Domains</Label>
            <p className="text-slate-400 text-sm">Domains allowed to embed tracking pixels (one per line)</p>
            <Textarea
              value={settings.security.allowedDomains.join('\n')}
              onChange={(e) => updateSecuritySetting('allowedDomains', e.target.value.split('\n').filter(d => d.trim()))}
              placeholder="example.com&#10;subdomain.example.com"
              className="bg-slate-700 border-slate-600 text-white"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-white">Database</CardTitle>
          </div>
          <CardDescription className="text-slate-400">
            Database configuration and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-300">Data Retention (Days)</Label>
            <p className="text-slate-400 text-sm">How long to keep tracking data</p>
            <Select 
              value={settings.database.retentionDays.toString()} 
              onValueChange={(value) => updateDatabaseSetting('retentionDays', parseInt(value))}
            >
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
                <SelectItem value="-1">Never Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300 font-medium">Auto Cleanup</Label>
              <p className="text-slate-400 text-sm">Automatically delete old data</p>
            </div>
            <Switch
              checked={settings.database.autoCleanup}
              onCheckedChange={(checked) => updateDatabaseSetting('autoCleanup', checked)}
            />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <Button
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <Database className="h-4 w-4 mr-2" />
              Cleanup Old Data Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Settings

