import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './AdminPanel.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardStats, setDashboardStats] = useState(null);
    const [usersData, setUsersData] = useState([]);
    const [campaignsData, setCampaignsData] = useState([]);
    const [subscriptionsData, setSubscriptionsData] = useState([]);
    const [ticketsData, setTicketsData] = useState([]);
    const [securityData, setSecurityData] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [adminSettings, setAdminSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [userFilters, setUserFilters] = useState({ status: 'all', role: 'all', search: '' });
    const [campaignFilters, setCampaignFilters] = useState({ status: 'all', search: '' });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            switch (activeTab) {
                case 'dashboard':
                    const dashResponse = await axios.get('/api/admin/dashboard');
                    setDashboardStats(dashResponse.data);
                    break;
                case 'users':
                    const usersResponse = await axios.get('/api/admin/users', {
                        params: userFilters
                    });
                    setUsersData(usersResponse.data.users || []);
                    break;
                case 'campaigns':
                    const campaignsResponse = await axios.get('/api/admin/campaigns', {
                        params: campaignFilters
                    });
                    setCampaignsData(campaignsResponse.data.campaigns || []);
                    break;
                case 'security':
                    const securityResponse = await axios.get('/api/admin/security');
                    const threatsResponse = await axios.get('/api/admin/security/threats');
                    setSecurityData({
                        ...securityResponse.data,
                        threats: threatsResponse.data.threats || [],
                        ip_statistics: threatsResponse.data.ip_statistics || []
                    });
                    break;
                case 'subscriptions':
                    const subsResponse = await axios.get('/api/admin/subscriptions');
                    setSubscriptionsData(subsResponse.data.subscriptions || []);
                    break;
                case 'tickets':
                    const ticketsResponse = await axios.get('/api/admin/tickets');
                    setTicketsData(ticketsResponse.data || []);
                    break;
                case 'audit':
                    const auditResponse = await axios.get('/api/admin/audit-logs');
                    setAuditLogs(auditResponse.data.logs || []);
                    break;
                case 'settings':
                    const settingsResponse = await axios.get('/api/admin/settings');
                    setAdminSettings(settingsResponse.data.settings || []);
                    break;
            }
        } catch (err) {
            setError('Failed to load data for ' + activeTab);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'dashboard', label: 'Dashboard Overview', icon: '📊' },
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'campaigns', label: 'Campaign Management', icon: '🎯' },
        { id: 'security', label: 'Security & Threats', icon: '🛡️' },
        { id: 'subscriptions', label: 'Subscriptions', icon: '💳' },
        { id: 'tickets', label: 'Support & Ticketing', icon: '🎫' },
        { id: 'audit', label: 'Audit Logs & Reports', icon: '📋' },
        { id: 'settings', label: 'Settings', icon: '⚙️' }
    ];

    const handleUserAction = async (action, userId, data = {}) => {
        try {
            let response;
            switch (action) {
                case 'approve':
                    response = await axios.post(`/api/admin/users/${userId}/approve`, data);
                    break;
                case 'suspend':
                    response = await axios.post(`/api/admin/users/${userId}/suspend`);
                    break;
                case 'activate':
                    response = await axios.post(`/api/admin/users/${userId}/activate`);
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                        response = await axios.delete(`/api/admin/users/${userId}/delete`);
                    }
                    break;
                case 'reset-password':
                    response = await axios.post(`/api/admin/users/${userId}/reset-password`, data);
                    break;
            }
            
            if (response) {
                alert(response.data.message);
                fetchData(); // Refresh data
            }
        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleCampaignAction = async (action, campaignId) => {
        try {
            let response;
            switch (action) {
                case 'suspend':
                    response = await axios.post(`/api/admin/campaigns/${campaignId}/suspend`);
                    break;
                case 'delete':
                    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                        response = await axios.delete(`/api/admin/campaigns/${campaignId}/delete`);
                    }
                    break;
            }
            
            if (response) {
                alert(response.data.message);
                fetchData(); // Refresh data
            }
        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleSubscriptionAction = async (action, subscriptionId, data = {}) => {
        try {
            let response;
            switch (action) {
                case 'approve':
                    response = await axios.post(`/api/admin/subscriptions/${subscriptionId}/approve`, data);
                    break;
                case 'reject':
                    response = await axios.post(`/api/admin/subscriptions/${subscriptionId}/reject`, data);
                    break;
            }
            
            if (response) {
                alert(response.data.message);
                fetchData(); // Refresh data
            }
        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || error.message));
        }
    };

    const renderTabNavigation = () => (
        <div className="admin-tabs">
            {isMobile ? (
                <select 
                    value={activeTab} 
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="mobile-tab-select"
                >
                    {tabs.map(tab => (
                        <option key={tab.id} value={tab.id}>
                            {tab.icon} {tab.label}
                        </option>
                    ))}
                </select>
            ) : (
                <div className="tab-buttons">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span className="tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const renderDashboard = () => {
        if (!dashboardStats) return <div className="loading">Loading dashboard...</div>;

        const userGrowthData = {
            labels: dashboardStats.user_growth?.map(d => d.date) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'New Users',
                    data: dashboardStats.user_growth?.map(d => d.count) || [12, 19, 15, 25, 22, 30, 28],
                    borderColor: 'rgba(37, 117, 252, 1)',
                    backgroundColor: 'rgba(37, 117, 252, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        const revenueData = {
            labels: dashboardStats.revenue_breakdown?.map(r => r.plan) || ['Free', 'Pro'],
            datasets: [
                {
                    data: dashboardStats.revenue_breakdown?.map(r => r.amount) || [0, 15000],
                    backgroundColor: [
                        'rgba(106, 17, 203, 0.8)',
                        'rgba(37, 117, 252, 0.8)'
                    ]
                }
            ]
        };

        return (
            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Admin Dashboard</h2>
                    <p>Real-time overview of your platform</p>
                </div>

                {/* Key Metrics */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon">👥</div>
                        <div className="metric-value">{dashboardStats.total_users || 0}</div>
                        <div className="metric-label">Total Users</div>
                        <div className="metric-change positive">+{dashboardStats.user_growth_percentage || 15}%</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">🔗</div>
                        <div className="metric-value">{dashboardStats.total_links || 0}</div>
                        <div className="metric-label">Total Links</div>
                        <div className="metric-change positive">+{dashboardStats.link_growth_percentage || 8}%</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">📊</div>
                        <div className="metric-value">{dashboardStats.total_clicks || 0}</div>
                        <div className="metric-label">Total Clicks</div>
                        <div className="metric-change positive">+{dashboardStats.click_growth_percentage || 23}%</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">💰</div>
                        <div className="metric-value">${dashboardStats.total_revenue || 0}</div>
                        <div className="metric-label">Monthly Revenue</div>
                        <div className="metric-change positive">+{dashboardStats.revenue_growth_percentage || 12}%</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">🎫</div>
                        <div className="metric-value">{dashboardStats.open_tickets || 0}</div>
                        <div className="metric-label">Open Tickets</div>
                        <div className="metric-change negative">-{dashboardStats.ticket_reduction_percentage || 5}%</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-icon">🛡️</div>
                        <div className="metric-value">{dashboardStats.threats_blocked || 0}</div>
                        <div className="metric-label">Threats Blocked</div>
                        <div className="metric-change positive">+{dashboardStats.security_improvement || 18}%</div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    <div className="chart-container large-chart">
                        <h3>User Growth Trend</h3>
                        <div className="chart-wrapper">
                            <Line data={userGrowthData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { 
                                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                        ticks: { color: '#94a3b8' }
                                    },
                                    y: { 
                                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                                        ticks: { color: '#94a3b8' }
                                    }
                                }
                            }} />
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3>Revenue Distribution</h3>
                        <div className="chart-wrapper">
                            <Doughnut data={revenueData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: { color: '#94a3b8' }
                                    }
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderUserManagement = () => (
        <div className="user-management-content">
            <div className="section-header">
                <h2>User Management</h2>
                <button className="add-user-btn">Add New User</button>
            </div>
            
            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersData.map(user => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">{user.username?.charAt(0)?.toUpperCase()}</div>
                                        <span>{user.username}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`plan-badge ${user.plan?.toLowerCase()}`}>
                                        {user.plan || 'Free'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status?.toLowerCase()}`}>
                                        {user.status || 'Active'}
                                    </span>
                                </td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="edit-btn">Edit</button>
                                        <button className="delete-btn">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderCampaignManagement = () => (
        <div className="campaign-management-content">
            <div className="section-header">
                <h2>Campaign Management</h2>
                <button className="add-campaign-btn">Create Campaign</button>
            </div>
            
            <div className="campaigns-table-container">
                <table className="campaigns-table">
                    <thead>
                        <tr>
                            <th>Campaign Name</th>
                            <th>Owner</th>
                            <th>Status</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaignsData.map(campaign => (
                            <tr key={campaign.id}>
                                <td>{campaign.name}</td>
                                <td>{campaign.owner}</td>
                                <td>
                                    <span className={`status-badge ${campaign.status?.toLowerCase()}`}>
                                        {campaign.status || 'Active'}
                                    </span>
                                </td>
                                <td>{new Date(campaign.start_date).toLocaleDateString()}</td>
                                <td>{new Date(campaign.end_date).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="edit-btn">Edit</button>
                                        <button className="delete-btn">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSecurity = () => {
        if (!securityData) return <div className="loading">Loading security data...</div>;

        return (
            <div className="security-content">
                <div className="section-header">
                    <h2>Security & Threats</h2>
                </div>

                <div className="security-overview">
                    <div className="security-card">
                        <div className="security-icon">🛡️</div>
                        <div className="security-value">{securityData.total_threats || 0}</div>
                        <div className="security-label">Total Threats Detected</div>
                    </div>
                    <div className="security-card">
                        <div className="security-icon">🚫</div>
                        <div className="security-value">{securityData.blocked_ips || 0}</div>
                        <div className="security-label">IPs Blocked</div>
                    </div>
                    <div className="security-card">
                        <div className="security-icon">✅</div>
                        <div className="security-value">{securityData.whitelisted_ips || 0}</div>
                        <div className="security-label">IPs Whitelisted</div>
                    </div>
                </div>

                <div className="security-section">
                    <h3>Threats Log</h3>
                    <div className="threats-table-container">
                        <table className="threats-table">
                            <thead>
                                <tr>
                                    <th>IP Address</th>
                                    <th>Reason</th>
                                    <th>Timestamp</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {securityData.threats.map(threat => (
                                    <tr key={threat.id}>
                                        <td>{threat.ip_address}</td>
                                        <td>{threat.reason}</td>
                                        <td>{new Date(threat.timestamp).toLocaleString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="block-btn">Block</button>
                                                <button className="whitelist-btn">Whitelist</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderSubscriptions = () => (
        <div className="subscriptions-content">
            <div className="section-header">
                <h2>Subscription Management</h2>
            </div>
            
            <div className="subscriptions-table-container">
                <table className="subscriptions-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Plan</th>
                            <th>Status</th>
                            <th>Transaction ID</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptionsData.map(sub => (
                            <tr key={sub.id}>
                                <td>{sub.user.username}</td>
                                <td>{sub.plan}</td>
                                <td>
                                    <span className={`status-badge ${sub.status?.toLowerCase()}`}>
                                        {sub.status}
                                    </span>
                                </td>
                                <td>{sub.transaction_id}</td>
                                <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                                <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="approve-btn">Approve</button>
                                        <button className="reject-btn">Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTickets = () => (
        <div className="tickets-content">
            <div className="section-header">
                <h2>Support & Ticketing</h2>
            </div>
            
            <div className="tickets-grid">
                {ticketsData.map(ticket => (
                    <div key={ticket.id} className="ticket-card">
                        <div className="ticket-header">
                            <span className="ticket-id">{ticket.ticket_id}</span>
                            <span className={`ticket-status ${ticket.status?.toLowerCase()}`}>{ticket.status}</span>
                        </div>
                        <h3 className="ticket-subject">{ticket.subject}</h3>
                        <p className="ticket-user">From: {ticket.user.username}</p>
                        <p className="ticket-date">Opened: {new Date(ticket.created_at).toLocaleString()}</p>
                        <div className="ticket-actions">
                            <button className="reply-btn">Reply</button>
                            <button className="resolve-btn">Resolve</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAuditLogs = () => (
        <div className="audit-logs-content">
            <div className="section-header">
                <h2>Audit Logs</h2>
            </div>
            
            <div className="audit-table-container">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th>Admin</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLogs.map(log => (
                            <tr key={log.id}>
                                <td>{log.admin.username}</td>
                                <td>{log.action}</td>
                                <td>{log.target_type} - {log.target_id}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="settings-content">
            <div className="section-header">
                <h2>Admin Settings</h2>
                <button className="save-settings-btn">Save Settings</button>
            </div>
            
            <div className="settings-sections">
                {adminSettings.map(setting => (
                    <div key={setting.id} className="setting-group">
                        <label>{setting.description}</label>
                        <input type="text" defaultValue={setting.value} />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Brain Link Tracker - Admin Panel</h1>
                <p>Enterprise-grade SaaS administration</p>
            </div>
            
            {renderTabNavigation()}
            
            <div className="admin-content">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'users' && renderUserManagement()}
                {activeTab === 'campaigns' && renderCampaignManagement()}
                {activeTab === 'security' && renderSecurity()}
                {activeTab === 'subscriptions' && renderSubscriptions()}
                {activeTab === 'tickets' && renderTickets()}
                {activeTab === 'audit' && renderAuditLogs()}
                {activeTab === 'settings' && renderSettings()}
            </div>
        </div>
    );
};

export default AdminPanel;


