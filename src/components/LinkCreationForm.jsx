import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Link, Globe, Calendar, Lock, Shield, Target } from 'lucide-react';

const LinkCreationForm = ({ onLinkCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    originalUrl: '',
    title: '',
    campaign: '',
    domain: 'vercel',
    customDomain: '',
    expiryDate: '',
    password: '',
    description: '',
    captureEmail: false,
    capturePassword: false,
    botBlocking: true,
    geoTargeting: false,
    geoTargetingType: 'allow',
    allowedCountries: [],
    blockedCountries: [],
    rateLimiting: false,
    dynamicSignature: false,
    mxVerification: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.originalUrl.trim()) {
      setError('Original URL is required');
      return false;
    }
    if (!formData.originalUrl.startsWith('http://') && !formData.originalUrl.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return false;
    }
    if (formData.domain === 'custom' && !formData.customDomain.trim()) {
      setError('Custom domain is required when custom domain option is selected');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        originalUrl: formData.originalUrl.trim(),
        title: formData.title.trim(),
        campaign: formData.campaign.trim() || 'Untitled Campaign',
        domain: formData.domain,
        customDomain: formData.customDomain.trim(),
        expiryDate: formData.expiryDate || null,
        password: formData.password,
        description: formData.description.trim(),
        capture_email: formData.captureEmail,
        capture_password: formData.capturePassword,
        bot_blocking_enabled: formData.botBlocking,
        geo_targeting_enabled: formData.geoTargeting,
        geo_targeting_type: formData.geoTargetingType,
        allowed_countries: formData.allowedCountries,
        blocked_countries: formData.blockedCountries,
        rate_limiting_enabled: formData.rateLimiting,
        dynamic_signature_enabled: formData.dynamicSignature,
        mx_verification_enabled: formData.mxVerification
      };

      const response = await fetch('/api/links/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Link created successfully!');
        setTimeout(() => {
          onLinkCreated(result.link);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create link');
      }
    } catch (error) {
      console.error('Error creating link:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Create New Link
        </CardTitle>
        <CardDescription>
          Create a new shortened link with advanced tracking and security features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="originalUrl" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Original URL *
              </Label>
              <Input
                id="originalUrl"
                type="url"
                value={formData.originalUrl}
                onChange={(e) => handleInputChange('originalUrl', e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Link title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Campaign
                </Label>
                <Input
                  id="campaign"
                  type="text"
                  value={formData.campaign}
                  onChange={(e) => handleInputChange('campaign', e.target.value)}
                  placeholder="Campaign name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Link description"
                rows={3}
              />
            </div>
          </div>

          {/* Domain Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Domain Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Domain Type</Label>
                <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vercel">Vercel Domain</SelectItem>
                    <SelectItem value="shortio">Short.io Domain</SelectItem>
                    <SelectItem value="custom">Custom Domain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.domain === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input
                    id="customDomain"
                    type="text"
                    value={formData.customDomain}
                    onChange={(e) => handleInputChange('customDomain', e.target.value)}
                    placeholder="yourdomain.com"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expiry Date (Optional)
                </Label>
                <Input
                  id="expiryDate"
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password Protection (Optional)
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.captureEmail}
                  onChange={(e) => handleInputChange('captureEmail', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Capture Email</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.capturePassword}
                  onChange={(e) => handleInputChange('capturePassword', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Capture Password</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.botBlocking}
                  onChange={(e) => handleInputChange('botBlocking', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Bot Blocking</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.geoTargeting}
                  onChange={(e) => handleInputChange('geoTargeting', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Geo Targeting</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.rateLimiting}
                  onChange={(e) => handleInputChange('rateLimiting', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Rate Limiting</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.dynamicSignature}
                  onChange={(e) => handleInputChange('dynamicSignature', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Dynamic Signature</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Link'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LinkCreationForm;

