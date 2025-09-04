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
  Bot, 
  Eye, 
  RefreshCw, 
  Settings,
  Activity,
  Zap,
  Target,
  Lock,
  Fingerprint,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

const AntiBotPanel = () => {
  const [stealthConfig, setStealthConfig] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedBrowserType, setSelectedBrowserType] = useState('chrome_windows')

  useEffect(() => {
    loadStealthConfig()
  }, [selectedBrowserType])

  const loadStealthConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/antibot/config/stealth?browser_type=${selectedBrowserType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStealthConfig(data.stealth_config)
      }
    } catch (error) {
      console.error('Error loading stealth config:', error)
    } finally {
      setLoading(false)
    }
  }

  const createStealthSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/antibot/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ browser_type: selectedBrowserType })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessionData(data.session)
      }
    } catch (error) {
      console.error('Error creating stealth session:', error)
    } finally {
      setLoading(false)
    }
  }

  const testDetection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/antibot/test/detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ request_interval: 2.0 })
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResults(data.test_results)
      }
    } catch (error) {
      console.error('Error testing detection:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskBadge = (riskLevel) => {
    const riskConfig = {
      high: { color: 'bg-red-600', text: 'High Risk', icon: XCircle },
      medium: { color: 'bg-yellow-600', text: 'Medium Risk', icon: AlertTriangle },
      low: { color: 'bg-green-600', text: 'Low Risk', icon: CheckCircle }
    }
    
    const config = riskConfig[riskLevel] || riskConfig.low
    const IconComponent = config.icon
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const formatFingerprint = (fingerprint) => {
    if (!fingerprint) return 'N/A'
    return `${fingerprint.substring(0, 8)}...${fingerprint.substring(-8)}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Advanced Anti-Bot SDK</h1>
            <p className="text-muted-foreground">Stealth automation and bot detection evasion</p>
          </div>
        </div>
        
        <Button
          onClick={loadStealthConfig}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Browser Type Selection */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Select browser type and generate stealth configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label className="text-foreground">Browser Type:</Label>
            <Select value={selectedBrowserType} onValueChange={setSelectedBrowserType}>
              <SelectTrigger className="w-48 bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="chrome_windows">Chrome (Windows)</SelectItem>
                <SelectItem value="chrome_mac">Chrome (macOS)</SelectItem>
                <SelectItem value="firefox_windows">Firefox (Windows)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={createStealthSession}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Zap className="h-4 w-4 mr-1" />
              Generate Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stealth Configuration */}
      {stealthConfig && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Stealth Fingerprint
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Generated browser fingerprint for stealth automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">User Agent</Label>
                <Textarea 
                  value={stealthConfig.fingerprint.user_agent}
                  readOnly
                  className="bg-input border-border text-foreground text-xs"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Screen Resolution</Label>
                <Input 
                  value={stealthConfig.fingerprint.screen_resolution}
                  readOnly
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Timezone</Label>
                <Input 
                  value={stealthConfig.fingerprint.timezone}
                  readOnly
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Language</Label>
                <Input 
                  value={stealthConfig.fingerprint.language}
                  readOnly
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Canvas Hash</Label>
                <Input 
                  value={formatFingerprint(stealthConfig.fingerprint.canvas_hash)}
                  readOnly
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Audio Hash</Label>
                <Input 
                  value={formatFingerprint(stealthConfig.fingerprint.audio_hash)}
                  readOnly
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Information */}
      {sessionData && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Session
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Current stealth session information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Session ID</Label>
                <Input 
                  value={sessionData.session_id}
                  readOnly
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Fingerprint Hash</Label>
                <Input 
                  value={formatFingerprint(sessionData.fingerprint_hash)}
                  readOnly
                  className="bg-input border-border text-foreground font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detection Test */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="h-5 w-5" />
            Detection Test
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Test current request against bot detection systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testDetection}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            <Eye className="h-4 w-4 mr-1" />
            Test Detection
          </Button>
          
          {testResults && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4">
                <Label className="text-foreground font-medium">Risk Level:</Label>
                {getRiskBadge(testResults.risk_level)}
                <Label className="text-foreground font-medium">Overall Risk Score:</Label>
                <Badge variant="outline" className="border-border text-foreground">
                  {(testResults.overall_risk * 100).toFixed(1)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Recommendation</Label>
                <div className={`p-3 rounded-lg ${
                  testResults.risk_level === 'high' ? 'bg-red-900/20 border border-red-500' :
                  testResults.risk_level === 'medium' ? 'bg-yellow-900/20 border border-yellow-500' :
                  'bg-green-900/20 border border-green-500'
                }`}>
                  <p className="text-foreground font-medium">{testResults.recommendation}</p>
                </div>
              </div>
              
              {testResults.stealth_recommendations && testResults.stealth_recommendations.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Stealth Recommendations</Label>
                  <ul className="space-y-1">
                    {testResults.stealth_recommendations.map((rec, index) => (
                      <li key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-yellow-400" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Techniques */}
      {stealthConfig && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Advanced Evasion Techniques
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enabled stealth and evasion features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stealthConfig.advanced_techniques).map(([technique, enabled]) => (
                <div key={technique} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <span className="text-foreground text-sm capitalize">
                    {technique.replace(/_/g, ' ')}
                  </span>
                  {enabled ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {stealthConfig && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Best Practices
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Recommendations for maximum stealth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stealthConfig.recommendations.map((rec, index) => (
                <li key={index} className="text-muted-foreground text-sm flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AntiBotPanel

