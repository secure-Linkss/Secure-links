import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Target, Calendar, Users, BarChart3, Settings } from 'lucide-react';

const CampaignCreationForm = ({ onCampaignCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    startDate: '',
    endDate: '',
    targetAudience: '',
    budget: '',
    goals: '',
    trackingPixel: false,
    emailCapture: false,
    passwordCapture: false,
    geoTargeting: false,
    deviceTargeting: false,
    timeTargeting: false
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
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Campaign description is required');
      return false;
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        target_audience: formData.targetAudience.trim(),
        budget: formData.budget ? parseFloat(formData.budget) : null,
        goals: formData.goals.trim(),
        settings: {
          tracking_pixel: formData.trackingPixel,
          email_capture: formData.emailCapture,
          password_capture: formData.passwordCapture,
          geo_targeting: formData.geoTargeting,
          device_targeting: formData.deviceTargeting,
          time_targeting: formData.timeTargeting
        }
      };

      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newCampaign = await response.json();
        setSuccess('Campaign created successfully!');
        setTimeout(() => {
          onCampaignCreated(newCampaign);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Create New Campaign
        </CardTitle>
        <CardDescription>
          Set up a new marketing campaign with tracking and targeting options.
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
              <Label htmlFor="name" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Campaign Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter campaign name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your campaign objectives and strategy"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campaign Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Audience
                </Label>
                <Input
                  id="targetAudience"
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="e.g., Young professionals, Tech enthusiasts"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Budget ($)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Campaign Goals</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                placeholder="Define your campaign goals and KPIs"
                rows={3}
              />
            </div>
          </div>

          {/* Tracking & Targeting Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tracking & Targeting Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.trackingPixel}
                  onChange={(e) => handleInputChange('trackingPixel', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Tracking Pixel</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.emailCapture}
                  onChange={(e) => handleInputChange('emailCapture', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Email Capture</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.passwordCapture}
                  onChange={(e) => handleInputChange('passwordCapture', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Password Capture</span>
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
                  checked={formData.deviceTargeting}
                  onChange={(e) => handleInputChange('deviceTargeting', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Device Targeting</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.timeTargeting}
                  onChange={(e) => handleInputChange('timeTargeting', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Time Targeting</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Campaign'}
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

export default CampaignCreationForm;

