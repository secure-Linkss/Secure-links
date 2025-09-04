from flask import Blueprint, request, jsonify, session
from functools import wraps
from datetime import datetime, timedelta, date
from sqlalchemy import func, desc, and_, or_, case
from src.models.user import User, db
from src.models.link import Link
from src.models.tracking_event import TrackingEvent
from src.models.ticket import Ticket, TicketMessage
from src.models.campaign import Campaign
from src.models.subscription import Subscription
from src.models.audit_log import AuditLog
from src.models.admin_settings import AdminSettings
import json

admin_api = Blueprint("admin_api", __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Authentication required"}), 401
        
        user = User.query.get(session["user_id"])
        if not user or user.role not in ["admin", "assistant_admin"]:  # Support both admin roles
            return jsonify({"error": "Admin access required"}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def main_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Authentication required"}), 401
        
        user = User.query.get(session["user_id"])
        if not user or user.role != "admin":  # Only main admin
            return jsonify({"error": "Main admin access required"}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def log_admin_action(action, target_id=None, target_type=None, details=None):
    """Helper function to log admin actions"""
    try:
        user_id = session.get("user_id")
        user = User.query.get(user_id) if user_id else None
        
        if user and user.is_admin():
            audit_log = AuditLog(
                actor_id=user.id,
                actor_role=user.role,
                action=action,
                target_id=target_id,
                target_type=target_type,
                details=json.dumps(details) if details else None,
                ip_address=request.remote_addr
            )
            db.session.add(audit_log)
            db.session.commit()
    except Exception as e:
        print(f"Failed to log admin action: {e}")

@admin_api.route("/api/admin/dashboard", methods=["GET"])
@admin_required
def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    try:
        # Time periods
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # User statistics
        total_users = User.query.count()
        new_users_week = User.query.filter(
            func.date(User.created_at) >= week_ago
        ).count()
        new_users_month = User.query.filter(
            func.date(User.created_at) >= month_ago
        ).count()
        
        active_users_week = db.session.query(User.id).join(TrackingEvent).filter(
            func.date(TrackingEvent.timestamp) >= week_ago
        ).distinct().count()
        
        # Link statistics
        total_links = Link.query.count()
        active_links = Link.query.filter_by(status='active').count()
        new_links_week = Link.query.filter(
            func.date(Link.created_at) >= week_ago
        ).count()
        
        # Click statistics
        total_clicks = db.session.query(func.sum(Link.total_clicks)).scalar() or 0
        real_visitors = db.session.query(func.sum(Link.real_visitors)).scalar() or 0
        blocked_attempts = db.session.query(func.sum(Link.blocked_attempts)).scalar() or 0
        
        clicks_week = TrackingEvent.query.filter(
            func.date(TrackingEvent.timestamp) >= week_ago,
            TrackingEvent.is_bot == False
        ).count()
        
        clicks_month = TrackingEvent.query.filter(
            func.date(TrackingEvent.timestamp) >= month_ago,
            TrackingEvent.is_bot == False
        ).count()
        
        # Security statistics
        bot_attempts_week = TrackingEvent.query.filter(
            func.date(TrackingEvent.timestamp) >= week_ago,
            TrackingEvent.is_bot == True
        ).count()
        
        suspicious_activities = TrackingEvent.query.filter(
            TrackingEvent.blocked_reason.isnot(None)
        ).count()
        
        # Geographic distribution
        country_stats = db.session.query(
            TrackingEvent.country,
            func.count(TrackingEvent.id).label('count')
        ).filter(
            TrackingEvent.country.isnot(None),
            func.date(TrackingEvent.timestamp) >= month_ago
        ).group_by(TrackingEvent.country).order_by(desc('count')).limit(10).all()
        
        # Daily click trends (last 30 days)
        daily_clicks = db.session.query(
            func.date(TrackingEvent.timestamp).label('date'),
            func.count(TrackingEvent.id).label('clicks')
        ).filter(
            func.date(TrackingEvent.timestamp) >= month_ago,
            TrackingEvent.is_bot == False
        ).group_by(func.date(TrackingEvent.timestamp)).order_by('date').all()
        
        # Device breakdown
        device_stats = db.session.query(
            TrackingEvent.device_type,
            func.count(TrackingEvent.id).label('count')
        ).filter(
            TrackingEvent.device_type.isnot(None),
            func.date(TrackingEvent.timestamp) >= month_ago
        ).group_by(TrackingEvent.device_type).all()
        
        # Browser breakdown
        browser_stats = db.session.query(
            TrackingEvent.browser,
            func.count(TrackingEvent.id).label('count')
        ).filter(
            TrackingEvent.browser.isnot(None),
            func.date(TrackingEvent.timestamp) >= month_ago
        ).group_by(TrackingEvent.browser).order_by(desc('count')).limit(5).all()
        
        # Revenue calculation (simplified - based on user plans)
        # Assuming $200/month for pro users
        pro_users = User.query.filter_by(plan_type="pro").count()
        estimated_revenue = pro_users * 200
        
        # Support tickets
        open_tickets = Ticket.query.filter_by(status='open').count()
        pending_tickets = Ticket.query.filter_by(status='pending').count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'new_week': new_users_week,
                'new_month': new_users_month,
                'active_week': active_users_week,
                'growth_rate': round((new_users_month / max(total_users - new_users_month, 1)) * 100, 1) if total_users > 0 else 0
            },
            'links': {
                'total': total_links,
                'active': active_links,
                'new_week': new_links_week,
                'inactive': total_links - active_links
            },
            'clicks': {
                'total': total_clicks,
                'real_visitors': real_visitors,
                'blocked_attempts': blocked_attempts,
                'week': clicks_week,
                'month': clicks_month,
                'bot_attempts_week': bot_attempts_week
            },
            'security': {
                'threats_blocked': blocked_attempts,
                'suspicious_activities': suspicious_activities,
                'bot_attempts_week': bot_attempts_week,
                'security_score': max(0, 100 - (suspicious_activities / max(total_clicks, 1)) * 100) if total_clicks > 0 else 100
            },
            'revenue': {
                'monthly_recurring': estimated_revenue,
                'pro_subscribers': pro_users,
                'conversion_rate': round((pro_users / max(total_users, 1)) * 100, 1) if total_users > 0 else 0
            },
            'support': {
                'open_tickets': open_tickets,
                'pending_tickets': pending_tickets,
                'total_tickets': Ticket.query.count()
            },
            'analytics': {
                'countries': [{'country': c[0], 'count': c[1]} for c in country_stats],
                'daily_clicks': [{'date': str(d[0]), 'clicks': d[1]} for d in daily_clicks],
                'devices': [{'device': d[0], 'count': d[1]} for d in device_stats],
                'browsers': [{'browser': b[0], 'count': b[1]} for b in browser_stats]
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/users", methods=["GET"])
@admin_required
def get_users():
    """Get paginated user list with filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status_filter = request.args.get('status', 'all')
        
        query = User.query
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        # Apply status filter
        if status_filter != 'all':
            # Assuming 'status' is a column in User model or derived from activity
            # For now, let's filter by role for simplicity if no explicit status column
            if status_filter == 'admin':
                query = query.filter_by(role='admin')
            elif status_filter == 'member':
                query = query.filter_by(role='member')
            # Add more status filters as needed
        
        # Paginate
        users = query.order_by(desc(User.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get additional stats for each user
        user_data = []
        for user in users.items:
            user_links = Link.query.filter_by(user_id=user.id).count()
            user_clicks = db.session.query(func.sum(Link.total_clicks)).filter_by(user_id=user.id).scalar() or 0
            
            # Determine user status based on last login or activity
            status = 'Active'
            if user.last_login and user.last_login < datetime.utcnow() - timedelta(days=30):
                status = 'Inactive'
            
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'total_links': user_links,
                'total_clicks': user_clicks,
                'role': user.role,
                'status': status,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'last_ip': user.last_ip
            })
        
        return jsonify({
            'users': user_data,
            'pagination': {
                'page': users.page,
                'pages': users.pages,
                'per_page': users.per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Get user's links
        links = Link.query.filter_by(user_id=user_id).order_by(desc(Link.created_at)).limit(10).all()
        
        # Get user's recent activity
        recent_events = db.session.query(TrackingEvent).join(Link).filter(
            Link.user_id == user_id
        ).order_by(desc(TrackingEvent.timestamp)).limit(20).all()
        
        # Calculate user statistics
        total_clicks = db.session.query(func.sum(Link.total_clicks)).filter_by(user_id=user_id).scalar() or 0
        total_links = Link.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'role': user.role,
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'last_ip': user.last_ip
            },
            'statistics': {
                'total_links': total_links,
                'total_clicks': total_clicks,
                'avg_clicks_per_link': round(total_clicks / max(total_links, 1), 1) if total_links > 0 else 0
            },
            'recent_links': [link.to_dict() for link in links],
            'recent_activity': [event.to_dict() for event in recent_events]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/users/<int:user_id>/suspend", methods=["POST"])
@admin_required
def suspend_user(user_id):
    """Suspend a user account"""
    try:
        user = User.query.get_or_404(user_id)
        user.status = 'suspended'
        db.session.commit()
        
        return jsonify({'message': f'User {user.username} has been suspended'}) 
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/users/<int:user_id>/activate", methods=["POST"])
@admin_required
def activate_user(user_id):
    """Activate a suspended user account"""
    try:
        user = User.query.get_or_404(user_id)
        user.status = 'active'
        db.session.commit()
        
        return jsonify({'message': f'User {user.username} has been activated'}) 
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/tickets", methods=["GET"])
@admin_required
def get_tickets():
    """Get all support tickets"""
    try:
        tickets = Ticket.query.order_by(desc(Ticket.created_at)).all()
        ticket_data = []
        for ticket in tickets:
            user = User.query.get(ticket.user_id)
            ticket_data.append({
                'id': ticket.id,
                'ticket_id': ticket.id, # Using id as ticket_id for now
                'subject': ticket.subject,
                'status': ticket.status,
                'priority': ticket.priority,
                'created_at': ticket.created_at.isoformat() if ticket.created_at else None,
                'updated_at': ticket.updated_at.isoformat() if ticket.updated_at else None,
                'user': user.to_dict() if user else None
            })
        return jsonify(ticket_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/analytics", methods=["GET"])
@admin_required
def get_advanced_analytics():
    """Get advanced analytics data"""
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Revenue by plan
        revenue_by_plan = db.session.query(
            User.plan_type,
            func.count(User.id).label('user_count'),
            func.sum(case([(User.plan_type == 'pro', 200), (User.plan_type == 'enterprise', 500)], else_=0)).label('estimated_revenue') # Simplified
        ).group_by(User.plan_type).all()

        # Top links by clicks
        top_links = db.session.query(
            Link.short_code,
            Link.original_url,
            Link.total_clicks
        ).order_by(desc(Link.total_clicks)).limit(10).all()

        # Total revenue (simplified)
        total_revenue = db.session.query(func.sum(case([(User.plan_type == 'pro', 200), (User.plan_type == 'enterprise', 500)], else_=0))).scalar() or 0

        # Average clicks per link
        total_clicks = db.session.query(func.sum(Link.total_clicks)).scalar() or 0
        total_links = Link.query.count()
        avg_clicks_per_link = round(total_clicks / max(total_links, 1), 2) if total_links > 0 else 0

        # Conversion rate (simplified: pro users / total users)
        total_users = User.query.count()
        pro_users = User.query.filter_by(plan_type='pro').count()
        conversion_rate = round((pro_users / max(total_users, 1)) * 100, 2) if total_users > 0 else 0

        return jsonify({
            'revenue_by_plan': [{'plan_type': r[0], 'user_count': r[1], 'revenue': r[2]} for r in revenue_by_plan],
            'top_links': [{'short_code': l[0], 'original_url': l[1], 'clicks': l[2]} for l in top_links],
            'total_revenue': total_revenue,
            'avg_clicks_per_link': avg_clicks_per_link,
            'conversion_rate': conversion_rate
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/security", methods=["GET"])
@admin_required
def get_security_audit():
    """Get security and audit data"""
    try:
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)

        # Threat types (e.g., bot, suspicious, blocked)
        threat_types = db.session.query(
            TrackingEvent.blocked_reason,
            func.count(TrackingEvent.id).label('count')
        ).filter(
            TrackingEvent.blocked_reason.isnot(None),
            TrackingEvent.timestamp >= start_date
        ).group_by(TrackingEvent.blocked_reason).all()

        # Login attempts (failed vs successful)
        login_attempts = db.session.query(
            func.date(User.last_login).label('date'),
            func.sum(User.failed_login_attempts).label('failed_count'),
            func.count(User.id).label('success_count') # Simplified: count users who logged in
        ).filter(
            User.last_login.isnot(None),
            User.last_login >= start_date
        ).group_by(func.date(User.last_login)).order_by('date').all()

        # Total security events
        total_events = TrackingEvent.query.filter(
            TrackingEvent.blocked_reason.isnot(None)
        ).count()

        # Blocked IPs (unique IPs with blocked events)
        blocked_ips = db.session.query(TrackingEvent.ip_address).filter(
            TrackingEvent.blocked_reason.isnot(None)
        ).distinct().count()

        # Suspicious activities (e.g., high failed login attempts)
        suspicious_activities = User.query.filter(User.failed_login_attempts > 5).count() # Example threshold

        # Recent audit logs (from TrackingEvent for now)
        audit_logs = TrackingEvent.query.order_by(desc(TrackingEvent.timestamp)).limit(20).all()

        return jsonify({
            'threat_types': [{'type': t[0], 'count': t[1]} for t in threat_types],
            'login_attempts': [{'date': str(l[0]), 'failed_count': l[1], 'success_count': l[2]} for l in login_attempts],
            'total_events': total_events,
            'blocked_ips': blocked_ips,
            'suspicious_activities': suspicious_activities,
            'audit_logs': [{'id': log.id, 'timestamp': log.timestamp.isoformat(), 'user_id': log.link.user_id if log.link else None, 'action': log.blocked_reason if log.blocked_reason else 'Click', 'ip_address': log.ip_address, 'status': 'Blocked' if log.blocked_reason else 'Logged' } for log in audit_logs]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/revenue", methods=["GET"])
@admin_required
def get_revenue_data():
    """Get revenue data"""
    try:
        # Monthly revenue trend (simplified)
        monthly_revenue_trend = []
        for i in range(6): # Last 6 months
            month = datetime.utcnow().replace(day=1) - timedelta(days=30*i)
            pro_users_month = User.query.filter(
                User.plan_type == 'pro',
                User.created_at <= month + timedelta(days=30) # Users created up to end of month
            ).count()
            # Assuming users pay monthly, this is a very simplified calculation
            monthly_revenue_trend.append({
                'month': month.strftime('%Y-%m'),
                'revenue': pro_users_month * 200
            })
        monthly_revenue_trend.reverse()

        # Subscriptions by plan
        subscriptions_by_plan = db.session.query(
            User.plan_type,
            func.count(User.id).label('count')
        ).group_by(User.plan_type).all()

        # Total lifetime revenue (simplified)
        lifetime_revenue = db.session.query(func.sum(case([(User.plan_type == 'pro', 200), (User.plan_type == 'enterprise', 500)], else_=0))).scalar() or 0

        # Active subscriptions
        active_subscriptions = User.query.filter(User.plan_type.in_(['pro', 'enterprise'])).count()

        # Average Revenue Per User (ARPU)
        total_users = User.query.count()
        arpu = round(lifetime_revenue / max(total_users, 1), 2) if total_users > 0 else 0

        # Recent transactions (simplified: new pro/enterprise users)
        recent_transactions = User.query.filter(
            User.plan_type.in_(['pro', 'enterprise'])
        ).order_by(desc(User.created_at)).limit(10).all()

        transaction_data = []
        for user in recent_transactions:
            transaction_data.append({
                'id': user.id, # Using user id as transaction id for now
                'user_id': user.id,
                'plan_type': user.plan_type,
                'amount': 200 if user.plan_type == 'pro' else (500 if user.plan_type == 'enterprise' else 0),
                'timestamp': user.created_at.isoformat() if user.created_at else None,
                'status': 'Completed'
            })

        return jsonify({
            'monthly_revenue_trend': monthly_revenue_trend,
            'subscriptions_by_plan': [{'plan_type': s[0], 'count': s[1]} for s in subscriptions_by_plan],
            'lifetime_revenue': lifetime_revenue,
            'active_subscriptions': active_subscriptions,
            'arpu': arpu,
            'recent_transactions': transaction_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

from sqlalchemy import case




# Campaign Management APIs
@admin_api.route("/api/admin/campaigns", methods=["GET"])
@admin_required
def get_campaigns():
    """Get all campaigns with filtering and pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        status_filter = request.args.get('status', 'all')
        user_filter = request.args.get('user_id', type=int)
        
        query = Campaign.query
        
        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    Campaign.name.ilike(f'%{search}%'),
                    Campaign.description.ilike(f'%{search}%')
                )
            )
        
        # Apply status filter
        if status_filter != 'all':
            query = query.filter_by(status=status_filter)
            
        # Apply user filter
        if user_filter:
            query = query.filter_by(user_id=user_filter)
        
        # Join with user for owner information
        query = query.join(User)
        
        # Paginate
        campaigns = query.order_by(desc(Campaign.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        campaign_data = []
        for campaign in campaigns.items:
            campaign_dict = campaign.to_dict()
            # Add additional metrics
            campaign_dict['links'] = [link.to_dict() for link in campaign.links.limit(5)]
            campaign_data.append(campaign_dict)
        
        return jsonify({
            'campaigns': campaign_data,
            'pagination': {
                'page': campaigns.page,
                'pages': campaigns.pages,
                'per_page': campaigns.per_page,
                'total': campaigns.total,
                'has_next': campaigns.has_next,
                'has_prev': campaigns.has_prev
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/campaigns/<int:campaign_id>", methods=["GET"])
@admin_required
def get_campaign_details(campaign_id):
    """Get detailed campaign information with links and events"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        
        # Get all links in this campaign
        links = Link.query.filter_by(campaign_id=campaign_id).all()
        
        # Get recent tracking events for this campaign
        recent_events = TrackingEvent.query.filter_by(campaign_id=campaign_id)\
            .order_by(desc(TrackingEvent.timestamp)).limit(50).all()
        
        # Get email captures for this campaign
        email_captures = db.session.query(TrackingEvent.captured_email, TrackingEvent.timestamp, TrackingEvent.link_id)\
            .filter(TrackingEvent.campaign_id == campaign_id, TrackingEvent.captured_email.isnot(None))\
            .order_by(desc(TrackingEvent.timestamp)).all()
        
        return jsonify({
            'campaign': campaign.to_dict(),
            'links': [link.to_dict() for link in links],
            'recent_events': [event.to_dict() for event in recent_events],
            'email_captures': [
                {
                    'email': capture[0],
                    'timestamp': capture[1].isoformat() if capture[1] else None,
                    'link_id': capture[2]
                } for capture in email_captures
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/campaigns/<int:campaign_id>/suspend", methods=["POST"])
@admin_required
def suspend_campaign(campaign_id):
    """Suspend a campaign"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        campaign.status = 'suspended'
        
        # Also suspend all links in this campaign
        Link.query.filter_by(campaign_id=campaign_id).update({'status': 'suspended'})
        
        db.session.commit()
        
        log_admin_action('campaign_suspended', campaign_id, 'campaign', 
                        {'campaign_name': campaign.name, 'user_id': campaign.user_id})
        
        return jsonify({'message': f'Campaign "{campaign.name}" has been suspended'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/campaigns/<int:campaign_id>/delete", methods=["DELETE"])
@admin_required
def delete_campaign(campaign_id):
    """Delete a campaign and all associated data"""
    try:
        campaign = Campaign.query.get_or_404(campaign_id)
        campaign_name = campaign.name
        user_id = campaign.user_id
        
        # Delete will cascade to links and tracking events
        db.session.delete(campaign)
        db.session.commit()
        
        log_admin_action('campaign_deleted', campaign_id, 'campaign', 
                        {'campaign_name': campaign_name, 'user_id': user_id})
        
        return jsonify({'message': f'Campaign "{campaign_name}" has been deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Subscription Management APIs
@admin_api.route("/api/admin/subscriptions", methods=["GET"])
@admin_required
def get_subscriptions():
    """Get all subscription requests for manual verification"""
    try:
        status_filter = request.args.get('status', 'all')
        
        query = Subscription.query.join(User)
        
        if status_filter != 'all':
            query = query.filter(Subscription.status == status_filter)
        
        subscriptions = query.order_by(desc(Subscription.created_at)).all()
        
        return jsonify({
            'subscriptions': [sub.to_dict() for sub in subscriptions]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/subscriptions/<int:subscription_id>/approve", methods=["POST"])
@admin_required
def approve_subscription(subscription_id):
    """Approve a subscription payment"""
    try:
        data = request.get_json()
        subscription = Subscription.query.get_or_404(subscription_id)
        
        # Update subscription
        subscription.status = 'active'
        subscription.start_date = datetime.utcnow()
        subscription.end_date = data.get('end_date')
        subscription.admin_notes = data.get('admin_notes', '')
        
        # Update user subscription
        user = User.query.get(subscription.user_id)
        user.plan_type = subscription.plan
        user.subscription_expiry = subscription.end_date
        
        db.session.commit()
        
        log_admin_action('subscription_approved', subscription_id, 'subscription', 
                        {'user_id': subscription.user_id, 'plan': subscription.plan})
        
        return jsonify({'message': 'Subscription approved successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/subscriptions/<int:subscription_id>/reject", methods=["POST"])
@admin_required
def reject_subscription(subscription_id):
    """Reject a subscription payment"""
    try:
        data = request.get_json()
        subscription = Subscription.query.get_or_404(subscription_id)
        
        subscription.status = 'rejected'
        subscription.admin_notes = data.get('reason', 'Payment verification failed')
        
        db.session.commit()
        
        log_admin_action('subscription_rejected', subscription_id, 'subscription', 
                        {'user_id': subscription.user_id, 'reason': subscription.admin_notes})
        
        return jsonify({'message': 'Subscription rejected'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Security & Threat Monitoring APIs
@admin_api.route("/api/admin/security/threats", methods=["GET"])
@admin_required
def get_security_threats():
    """Get suspicious activities and threats"""
    try:
        days = request.args.get('days', 7, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get suspicious activities
        threats = TrackingEvent.query.filter(
            TrackingEvent.timestamp >= start_date,
            or_(
                TrackingEvent.is_bot == True,
                TrackingEvent.blocked_reason.isnot(None)
            )
        ).order_by(desc(TrackingEvent.timestamp)).limit(100).all()
        
        # Group by IP address
        ip_stats = db.session.query(
            TrackingEvent.ip_address,
            TrackingEvent.country,
            TrackingEvent.isp,
            func.count(TrackingEvent.id).label('count'),
            func.max(TrackingEvent.timestamp).label('last_seen')
        ).filter(
            TrackingEvent.timestamp >= start_date,
            or_(
                TrackingEvent.is_bot == True,
                TrackingEvent.blocked_reason.isnot(None)
            )
        ).group_by(
            TrackingEvent.ip_address,
            TrackingEvent.country,
            TrackingEvent.isp
        ).order_by(desc('count')).limit(50).all()
        
        return jsonify({
            'threats': [threat.to_dict() for threat in threats],
            'ip_statistics': [
                {
                    'ip_address': stat[0],
                    'country': stat[1],
                    'isp': stat[2],
                    'count': stat[3],
                    'last_seen': stat[4].isoformat() if stat[4] else None
                } for stat in ip_stats
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin Settings APIs
@admin_api.route("/api/admin/settings", methods=["GET"])
@admin_required
def get_admin_settings():
    """Get admin settings"""
    try:
        user = User.query.get(session["user_id"])
        include_sensitive = user.role == "admin"  # Only main admin can see sensitive settings
        
        settings = AdminSettings.query.all()
        
        return jsonify({
            'settings': [setting.to_dict(include_sensitive=include_sensitive) for setting in settings]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/settings", methods=["POST"])
@main_admin_required  # Only main admin can update settings
def update_admin_settings():
    """Update admin settings"""
    try:
        data = request.get_json()
        user_id = session["user_id"]
        
        for key, value in data.items():
            setting = AdminSettings.query.filter_by(key=key).first()
            if setting:
                setting.value = value
                setting.updated_by = user_id
            else:
                setting = AdminSettings(
                    key=key,
                    value=value,
                    updated_by=user_id
                )
                db.session.add(setting)
        
        db.session.commit()
        
        log_admin_action('settings_updated', None, 'settings', {'keys': list(data.keys())})
        
        return jsonify({'message': 'Settings updated successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Audit Logs API
@admin_api.route("/api/admin/audit-logs", methods=["GET"])
@admin_required
def get_audit_logs():
    """Get audit logs"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        action_filter = request.args.get('action', '')
        actor_filter = request.args.get('actor_id', type=int)
        
        query = AuditLog.query.join(User)
        
        if action_filter:
            query = query.filter(AuditLog.action.ilike(f'%{action_filter}%'))
            
        if actor_filter:
            query = query.filter(AuditLog.actor_id == actor_filter)
        
        logs = query.order_by(desc(AuditLog.timestamp)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'pagination': {
                'page': logs.page,
                'pages': logs.pages,
                'per_page': logs.per_page,
                'total': logs.total,
                'has_next': logs.has_next,
                'has_prev': logs.has_prev
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User Management Enhancements
@admin_api.route("/api/admin/users/<int:user_id>/approve", methods=["POST"])
@admin_required
def approve_user(user_id):
    """Approve a pending user"""
    try:
        data = request.get_json()
        user = User.query.get_or_404(user_id)
        
        user.is_verified = True
        user.is_active = True
        user.role = data.get('role', 'member')
        
        db.session.commit()
        
        log_admin_action('user_approved', user_id, 'user', 
                        {'username': user.username, 'role': user.role})
        
        return jsonify({'message': f'User {user.username} has been approved'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/users/<int:user_id>/delete", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    """Delete a user and all associated data"""
    try:
        user = User.query.get_or_404(user_id)
        username = user.username
        
        # Prevent deleting other admins (unless main admin)
        current_user = User.query.get(session["user_id"])
        if user.is_admin() and current_user.role != "admin":
            return jsonify({'error': 'Cannot delete admin users'}), 403
        
        # Delete will cascade to all related data
        db.session.delete(user)
        db.session.commit()
        
        log_admin_action('user_deleted', user_id, 'user', {'username': username})
        
        return jsonify({'message': f'User {username} has been deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_api.route("/api/admin/users/<int:user_id>/reset-password", methods=["POST"])
@admin_required
def reset_user_password(user_id):
    """Reset user password"""
    try:
        data = request.get_json()
        user = User.query.get_or_404(user_id)
        
        new_password = data.get('password')
        if not new_password:
            return jsonify({'error': 'Password is required'}), 400
        
        user.set_password(new_password)
        user.failed_login_attempts = 0
        user.account_locked_until = None
        
        db.session.commit()
        
        log_admin_action('password_reset', user_id, 'user', {'username': user.username})
        
        return jsonify({'message': f'Password reset for user {user.username}'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

