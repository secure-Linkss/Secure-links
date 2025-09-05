// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.currentPage = 1;
        this.logsPerPage = 50;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboard();
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/auth', {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (!data.authenticated) {
                window.location.href = '/login.html';
                return;
            }

            this.currentUser = data.user;
            
            // Check if user has admin privileges
            if (!['admin', 'main_admin'].includes(this.currentUser.role)) {
                this.showNotification('Access denied. Admin privileges required.', 'error');
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                return;
            }

            document.getElementById('current-user').textContent = `Welcome, ${this.currentUser.username}`;
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/login.html';
        }
    }

    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('-translate-x-full');
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', this.logout.bind(this));

        // User management
        document.getElementById('add-user-btn').addEventListener('click', () => {
            document.getElementById('add-user-modal').classList.add('active');
        });
        document.getElementById('cancel-add-user').addEventListener('click', () => {
            document.getElementById('add-user-modal').classList.remove('active');
        });
        document.getElementById('add-user-form').addEventListener('submit', this.addUser.bind(this));

        // Campaign management
        document.getElementById('add-campaign-btn').addEventListener('click', () => {
            document.getElementById('add-campaign-modal').classList.add('active');
        });
        document.getElementById('cancel-add-campaign').addEventListener('click', () => {
            document.getElementById('add-campaign-modal').classList.remove('active');
        });
        document.getElementById('add-campaign-form').addEventListener('submit', this.addCampaign.bind(this));

        // Edit user modal
        document.getElementById('cancel-edit-user').addEventListener('click', () => {
            document.getElementById('edit-user-modal').classList.remove('active');
        });
        document.getElementById('edit-user-form').addEventListener('submit', this.updateUser.bind(this));

        // Settings
        document.getElementById('profile-form').addEventListener('submit', this.updateProfile.bind(this));
        document.getElementById('password-form').addEventListener('submit', this.changePassword.bind(this));

        // Audit logs
        document.getElementById('refresh-logs-btn').addEventListener('click', () => {
            this.loadAuditLogs();
        });
        document.getElementById('logs-per-page').addEventListener('change', (e) => {
            this.logsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.loadAuditLogs();
        });

        // Notification close
        document.getElementById('close-notification').addEventListener('click', () => {
            document.getElementById('notification').classList.add('hidden');
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-gray-700');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active', 'bg-gray-700');

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Load content based on tab
        switch (tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'campaigns':
                this.loadCampaigns();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'audit-logs':
                this.loadAuditLogs();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    async loadDashboard() {
        try {
            // Load user analytics
            const userResponse = await fetch('/api/admin/analytics/users', {
                credentials: 'include'
            });
            const userData = await userResponse.json();

            // Load campaign analytics
            const campaignResponse = await fetch('/api/admin/analytics/campaigns', {
                credentials: 'include'
            });
            const campaignData = await campaignResponse.json();

            // Update dashboard stats
            document.getElementById('total-users').textContent = userData.total_users || 0;
            document.getElementById('active-users').textContent = userData.active_users || 0;
            document.getElementById('total-campaigns').textContent = campaignData.total_campaigns || 0;
            document.getElementById('total-links').textContent = campaignData.total_links || 0;

        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                credentials: 'include'
            });
            const users = await response.json();

            const tbody = document.getElementById('users-table');
            tbody.innerHTML = '';

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${user.username}</div>
                                <div class="text-sm text-gray-500">${user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getRoleBadgeClass(user.role)}">
                            ${user.role}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${user.is_active ? 'Active' : 'Suspended'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${user.plan_type}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${this.getUserActions(user)}
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Add event listeners for user actions
            this.setupUserActionListeners();

        } catch (error) {
            console.error('Failed to load users:', error);
            this.showNotification('Failed to load users', 'error');
        }
    }

    getUserActions(user) {
        const canEdit = this.currentUser.role === 'main_admin' || (this.currentUser.role === 'admin' && user.role === 'member');
        const canDelete = this.currentUser.role === 'main_admin' && user.role !== 'main_admin';
        const canSuspend = canEdit && user.role !== 'main_admin';
        const canChangeRole = this.currentUser.role === 'main_admin' && user.role !== 'main_admin';

        let actions = '';
        
        if (canEdit) {
            actions += `<button class="text-blue-600 hover:text-blue-900 mr-2 edit-user-btn" data-user-id="${user.id}">Edit</button>`;
        }
        
        if (canChangeRole) {
            actions += `<button class="text-purple-600 hover:text-purple-900 mr-2 change-role-btn" data-user-id="${user.id}" data-current-role="${user.role}">Role</button>`;
        }
        
        if (canSuspend) {
            const suspendText = user.is_active ? 'Suspend' : 'Activate';
            const suspendClass = user.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900';
            actions += `<button class="${suspendClass} mr-2 suspend-user-btn" data-user-id="${user.id}" data-suspend="${user.is_active}">${suspendText}</button>`;
        }
        
        if (canDelete) {
            actions += `<button class="text-red-600 hover:text-red-900 delete-user-btn" data-user-id="${user.id}">Delete</button>`;
        }

        return actions || 'No actions available';
    }

    setupUserActionListeners() {
        // Edit user
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userId;
                await this.openEditUserModal(userId);
            });
        });

        // Change role
        document.querySelectorAll('.change-role-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userId;
                const currentRole = e.target.dataset.currentRole;
                const newRole = currentRole === 'admin' ? 'member' : 'admin';
                await this.changeUserRole(userId, newRole);
            });
        });

        // Suspend/Activate user
        document.querySelectorAll('.suspend-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userId;
                const suspend = e.target.dataset.suspend === 'true';
                await this.suspendUser(userId, suspend);
            });
        });

        // Delete user
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userId;
                if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                    await this.deleteUser(userId);
                }
            });
        });
    }

    async openEditUserModal(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                credentials: 'include'
            });
            const user = await response.json();

            document.getElementById('edit-user-id').value = user.id;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-plan').value = user.plan_type;
            document.getElementById('edit-active').checked = user.is_active;
            document.getElementById('edit-verified').checked = user.is_verified;

            document.getElementById('edit-user-modal').classList.add('active');
        } catch (error) {
            console.error('Failed to load user details:', error);
            this.showNotification('Failed to load user details', 'error');
        }
    }

    async updateUser(e) {
        e.preventDefault();
        
        const userId = document.getElementById('edit-user-id').value;
        const userData = {
            email: document.getElementById('edit-email').value,
            plan_type: document.getElementById('edit-plan').value,
            is_active: document.getElementById('edit-active').checked,
            is_verified: document.getElementById('edit-verified').checked
        };

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                this.showNotification('User updated successfully', 'success');
                document.getElementById('edit-user-modal').classList.remove('active');
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to update user', 'error');
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            this.showNotification('Failed to update user', 'error');
        }
    }

    async changeUserRole(userId, newRole) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            });

            if (response.ok) {
                this.showNotification('User role updated successfully', 'success');
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to update user role', 'error');
            }
        } catch (error) {
            console.error('Failed to update user role:', error);
            this.showNotification('Failed to update user role', 'error');
        }
    }

    async suspendUser(userId, suspend) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/suspend`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ suspend })
            });

            if (response.ok) {
                const action = suspend ? 'suspended' : 'activated';
                this.showNotification(`User ${action} successfully`, 'success');
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to update user status', 'error');
            }
        } catch (error) {
            console.error('Failed to update user status:', error);
            this.showNotification('Failed to update user status', 'error');
        }
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                this.showNotification('User deleted successfully', 'success');
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            this.showNotification('Failed to delete user', 'error');
        }
    }

    async addUser(e) {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('new-username').value,
            email: document.getElementById('new-email').value,
            password: document.getElementById('new-password-field').value,
            role: document.getElementById('new-role').value,
            plan_type: document.getElementById('new-plan').value,
            is_active: true,
            is_verified: false
        };

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                this.showNotification('User created successfully', 'success');
                document.getElementById('add-user-modal').classList.remove('active');
                document.getElementById('add-user-form').reset();
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to create user', 'error');
            }
        } catch (error) {
            console.error('Failed to create user:', error);
            this.showNotification('Failed to create user', 'error');
        }
    }

    async loadCampaigns() {
        try {
            const response = await fetch('/api/admin/campaigns', {
                credentials: 'include'
            });
            const campaigns = await response.json();

            const tbody = document.getElementById('campaigns-table');
            tbody.innerHTML = '';

            campaigns.forEach(campaign => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${campaign.name}</div>
                        <div class="text-sm text-gray-500">${campaign.description || 'No description'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${campaign.owner_username || 'Unknown'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getStatusBadgeClass(campaign.status)}">
                            ${campaign.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(campaign.created_at).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-2 view-links-btn" data-campaign-id="${campaign.id}">Links</button>
                        <button class="text-green-600 hover:text-green-900 mr-2 edit-campaign-btn" data-campaign-id="${campaign.id}">Edit</button>
                        <button class="text-red-600 hover:text-red-900 delete-campaign-btn" data-campaign-id="${campaign.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Add event listeners for campaign actions
            this.setupCampaignActionListeners();

        } catch (error) {
            console.error('Failed to load campaigns:', error);
            this.showNotification('Failed to load campaigns', 'error');
        }
    }

    setupCampaignActionListeners() {
        // View links
        document.querySelectorAll('.view-links-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const campaignId = e.target.dataset.campaignId;
                await this.viewCampaignLinks(campaignId);
            });
        });

        // Delete campaign
        document.querySelectorAll('.delete-campaign-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const campaignId = e.target.dataset.campaignId;
                if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
                    await this.deleteCampaign(campaignId);
                }
            });
        });
    }

    async viewCampaignLinks(campaignId) {
        try {
            const response = await fetch(`/api/admin/campaigns/${campaignId}/links`, {
                credentials: 'include'
            });
            const links = await response.json();

            let message = `Campaign has ${links.length} links:\\n\\n`;
            links.forEach(link => {
                message += `• ${link.short_code}: ${link.target_url}\\n`;
            });

            alert(message);
        } catch (error) {
            console.error('Failed to load campaign links:', error);
            this.showNotification('Failed to load campaign links', 'error');
        }
    }

    async deleteCampaign(campaignId) {
        try {
            const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                this.showNotification('Campaign deleted successfully', 'success');
                this.loadCampaigns();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to delete campaign', 'error');
            }
        } catch (error) {
            console.error('Failed to delete campaign:', error);
            this.showNotification('Failed to delete campaign', 'error');
        }
    }

    async addCampaign(e) {
        e.preventDefault();
        
        const campaignData = {
            name: document.getElementById('new-campaign-name').value,
            description: document.getElementById('new-campaign-description').value,
            status: document.getElementById('new-campaign-status').value
        };

        try {
            const response = await fetch('/api/admin/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(campaignData)
            });

            if (response.ok) {
                this.showNotification('Campaign created successfully', 'success');
                document.getElementById('add-campaign-modal').classList.remove('active');
                document.getElementById('add-campaign-form').reset();
                this.loadCampaigns();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to create campaign', 'error');
            }
        } catch (error) {
            console.error('Failed to create campaign:', error);
            this.showNotification('Failed to create campaign', 'error');
        }
    }

    async loadAnalytics() {
        try {
            // Load user analytics
            const userResponse = await fetch('/api/admin/analytics/users', {
                credentials: 'include'
            });
            const userData = await userResponse.json();

            // Load campaign analytics
            const campaignResponse = await fetch('/api/admin/analytics/campaigns', {
                credentials: 'include'
            });
            const campaignData = await campaignResponse.json();

            // Update user analytics
            const userAnalytics = document.getElementById('user-analytics');
            userAnalytics.innerHTML = `
                <div class="flex justify-between">
                    <span>Total Users:</span>
                    <span class="font-semibold">${userData.total_users}</span>
                </div>
                <div class="flex justify-between">
                    <span>Active Users:</span>
                    <span class="font-semibold text-green-600">${userData.active_users}</span>
                </div>
                <div class="flex justify-between">
                    <span>Suspended Users:</span>
                    <span class="font-semibold text-red-600">${userData.suspended_users}</span>
                </div>
                <div class="flex justify-between">
                    <span>Verified Users:</span>
                    <span class="font-semibold text-blue-600">${userData.verified_users}</span>
                </div>
                <hr class="my-2">
                <div class="text-sm text-gray-600 mb-2">By Role:</div>
                <div class="flex justify-between text-sm">
                    <span>Main Admins:</span>
                    <span>${userData.users_by_role.main_admin}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Admins:</span>
                    <span>${userData.users_by_role.admin}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Members:</span>
                    <span>${userData.users_by_role.member}</span>
                </div>
                <hr class="my-2">
                <div class="text-sm text-gray-600 mb-2">By Plan:</div>
                <div class="flex justify-between text-sm">
                    <span>Free:</span>
                    <span>${userData.users_by_plan.free}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Pro:</span>
                    <span>${userData.users_by_plan.pro}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Enterprise:</span>
                    <span>${userData.users_by_plan.enterprise}</span>
                </div>
            `;

            // Update campaign analytics
            const campaignAnalytics = document.getElementById('campaign-analytics');
            campaignAnalytics.innerHTML = `
                <div class="flex justify-between">
                    <span>Total Campaigns:</span>
                    <span class="font-semibold">${campaignData.total_campaigns}</span>
                </div>
                <div class="flex justify-between">
                    <span>Active Campaigns:</span>
                    <span class="font-semibold text-green-600">${campaignData.active_campaigns}</span>
                </div>
                <div class="flex justify-between">
                    <span>Paused Campaigns:</span>
                    <span class="font-semibold text-yellow-600">${campaignData.paused_campaigns}</span>
                </div>
                <div class="flex justify-between">
                    <span>Completed Campaigns:</span>
                    <span class="font-semibold text-blue-600">${campaignData.completed_campaigns}</span>
                </div>
                <hr class="my-2">
                <div class="flex justify-between">
                    <span>Total Links:</span>
                    <span class="font-semibold">${campaignData.total_links}</span>
                </div>
            `;

        } catch (error) {
            console.error('Failed to load analytics:', error);
            this.showNotification('Failed to load analytics', 'error');
        }
    }

    async loadAuditLogs() {
        try {
            const response = await fetch(`/api/admin/audit-logs?page=${this.currentPage}&per_page=${this.logsPerPage}`, {
                credentials: 'include'
            });
            const data = await response.json();

            const tbody = document.getElementById('audit-logs-table');
            tbody.innerHTML = '';

            data.logs.forEach(log => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${new Date(log.created_at).toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${log.actor_username || 'Unknown'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${log.action}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${log.target_type || 'N/A'} ${log.target_id || ''}
                    </td>
                `;
                tbody.appendChild(row);
            });

            // Update pagination
            this.updateLogsPagination(data.current_page, data.pages, data.total);

        } catch (error) {
            console.error('Failed to load audit logs:', error);
            this.showNotification('Failed to load audit logs', 'error');
        }
    }

    updateLogsPagination(currentPage, totalPages, totalLogs) {
        const pagination = document.getElementById('logs-pagination');
        let paginationHTML = `<div class="flex justify-between items-center">`;
        paginationHTML += `<div class="text-sm text-gray-700">Showing ${totalLogs} total logs</div>`;
        paginationHTML += `<div class="flex space-x-2">`;

        if (currentPage > 1) {
            paginationHTML += `<button class="px-3 py-1 border rounded hover:bg-gray-100" onclick="adminPanel.goToLogsPage(${currentPage - 1})">Previous</button>`;
        }

        paginationHTML += `<span class="px-3 py-1">Page ${currentPage} of ${totalPages}</span>`;

        if (currentPage < totalPages) {
            paginationHTML += `<button class="px-3 py-1 border rounded hover:bg-gray-100" onclick="adminPanel.goToLogsPage(${currentPage + 1})">Next</button>`;
        }

        paginationHTML += `</div></div>`;
        pagination.innerHTML = paginationHTML;
    }

    goToLogsPage(page) {
        this.currentPage = page;
        this.loadAuditLogs();
    }

    async loadSettings() {
        try {
            const response = await fetch('/api/settings/profile', {
                credentials: 'include'
            });
            const profile = await response.json();

            document.getElementById('profile-username').value = profile.username;
            document.getElementById('profile-email').value = profile.email;

        } catch (error) {
            console.error('Failed to load settings:', error);
            this.showNotification('Failed to load settings', 'error');
        }
    }

    async updateProfile(e) {
        e.preventDefault();
        
        const profileData = {
            email: document.getElementById('profile-email').value
        };

        try {
            const response = await fetch('/api/settings/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                this.showNotification('Profile updated successfully', 'success');
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            this.showNotification('Failed to update profile', 'error');
        }
    }

    async changePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        const passwordData = {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        };

        try {
            const response = await fetch('/api/settings/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(passwordData)
            });

            if (response.ok) {
                this.showNotification('Password changed successfully', 'success');
                document.getElementById('password-form').reset();
            } else {
                const error = await response.json();
                this.showNotification(error.error || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Failed to change password:', error);
            this.showNotification('Failed to change password', 'error');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/login.html';
            } else {
                this.showNotification('Failed to logout', 'error');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            this.showNotification('Failed to logout', 'error');
        }
    }

    getRoleBadgeClass(role) {
        switch (role) {
            case 'main_admin':
                return 'bg-red-100 text-red-800';
            case 'admin':
                return 'bg-blue-100 text-blue-800';
            case 'member':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        messageElement.textContent = message;
        
        // Remove existing classes
        notification.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500', 'bg-yellow-500');
        
        // Add appropriate class based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }
        
        notification.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

