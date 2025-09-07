
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Edit, Save } from 'lucide-react';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedPrice, setEditedPrice] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      } else {
        console.error('Failed to fetch subscriptions:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPrice = (subscription) => {
    setEditingId(subscription.id);
    setEditedPrice(subscription.price.toString());
  };

  const handleSavePrice = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ price: parseFloat(editedPrice) })
      });
      if (response.ok) {
        fetchSubscriptions(); // Refresh the list
        setEditingId(null);
        alert('Subscription price updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update price: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Error updating price. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Subscription Plans</CardTitle>
          <Button size="sm" variant="outline" onClick={fetchSubscriptions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading subscriptions...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>
                      {editingId === subscription.id ? (
                        <Input
                          type="number"
                          value={editedPrice}
                          onChange={(e) => setEditedPrice(e.target.value)}
                          className="w-24"
                        />
                      ) : (
                        `$${subscription.price.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>{subscription.billing_cycle}</TableCell>
                    <TableCell className="text-right">
                      {editingId === subscription.id ? (
                        <Button size="sm" onClick={() => handleSavePrice(subscription.id)}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEditPrice(subscription)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Free Trial Management - Placeholder for now */}
      <Card>
        <CardHeader>
          <CardTitle>Free Trial Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Coming soon: Manage free trial durations for users.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;


