import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function Notifications() {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-settings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotificationSettings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch notification settings.');
      toast.error('Failed to load notification settings.');
      console.error('Fetch notification settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (settingName) => {
    const newValue = !notificationSettings[settingName];
    setNotificationSettings(prev => ({
      ...prev,
      [settingName]: newValue,
    }));

    try {
      const response = await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [settingName]: newValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      toast.success('Notification setting updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update notification setting.');
      toast.error('Failed to update notification setting.');
      console.error('Update notification setting error:', err);
      // Revert the change if the API call fails
      setNotificationSettings(prev => ({
        ...prev,
        [settingName]: !newValue,
      }));
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchNotificationSettings} className="mt-4">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
            <span>Email Notifications</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Receive notifications via email.
            </span>
          </Label>
          <Switch
            id="email-notifications"
            checked={notificationSettings.emailNotifications}
            onCheckedChange={() => handleToggle('emailNotifications')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sms-notifications" className="flex flex-col space-y-1">
            <span>SMS Notifications</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Receive notifications via SMS.
            </span>
          </Label>
          <Switch
            id="sms-notifications"
            checked={notificationSettings.smsNotifications}
            onCheckedChange={() => handleToggle('smsNotifications')}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
            <span>Push Notifications</span>
            <span className="font-normal leading-snug text-muted-foreground">
              Receive notifications via push messages.
            </span>
          </Label>
          <Switch
            id="push-notifications"
            checked={notificationSettings.pushNotifications}
            onCheckedChange={() => handleToggle('pushNotifications')}
          />
        </div>
      </CardContent>
    </Card>
  );
}


