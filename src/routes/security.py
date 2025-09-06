from flask import Blueprint, request, jsonify, g, session
from datetime import datetime, timedelta
import json
from src.models.user import User, db
from src.models.security import SecuritySettings, BlockedIP, BlockedCountry
from src.models.link import Link
from src.models.tracking_event import TrackingEvent
from functools import wraps

security_bp = Blueprint('security', __name__)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 401
        g.user = user
        return f(*args, **kwargs)
    
    return decorated_function

@security_bp.route('/api/security', methods=['GET'])
@require_auth
def get_security_data():
    """Get comprehensive security data including settings, blocked IPs, countries, and events"""
    try:
        # Get security settings
        settings_obj = SecuritySettings.query.filter_by(user_id=g.user.id).first()
        if settings_obj:
            settings = {
                'botProtection': settings_obj.bot_protection,
                'ipBlocking': settings_obj.ip_blocking,
                'rateLimiting': settings_obj.rate_limiting,
                'geoBlocking': settings_obj.geo_blocking,
                'vpnDetection': settings_obj.vpn_detection,
                'suspiciousActivityDetection': settings_obj.suspicious_activity_detection
            }
        else:
            # Default settings
            settings = {
                'botProtection': True,
                'ipBlocking': True,
                'rateLimiting': True,
                'geoBlocking': False,
                'vpnDetection': True,
                'suspiciousActivityDetection': True
            }
        
        # Get blocked IPs
        blocked_ips = BlockedIP.query.filter_by(user_id=g.user.id).order_by(BlockedIP.blocked_at.desc()).all()
        blocked_ips_data = [{
            'ip': ip.ip_address,
            'reason': ip.reason,
            'blockedAt': ip.blocked_at.isoformat(),
            'attempts': ip.attempt_count
        } for ip in blocked_ips]
        
        # Get blocked countries
        blocked_countries = BlockedCountry.query.filter_by(user_id=g.user.id).order_by(BlockedCountry.blocked_at.desc()).all()
        blocked_countries_data = [{
            'country': country.country,
            'code': country.country_code,
            'reason': country.reason,
            'blockedAt': country.blocked_at.isoformat()
        } for country in blocked_countries]
        
        # Get security events from tracking_event table
        events = db.session.query(
            TrackingEvent.id,
            TrackingEvent.timestamp,
            TrackingEvent.ip_address,
            TrackingEvent.user_agent,
            Link.campaign_name,
            Link.short_code
        ).join(Link, TrackingEvent.link_id == Link.id)
        .filter(Link.user_id == g.user.id)
        .order_by(TrackingEvent.timestamp.desc())
        .limit(50).all()

        events_data = []
        for event in events:
            event_type = 'normal_access'
            severity = 'low'
            if 'bot' in event.user_agent.lower() or 'crawler' in event.user_agent.lower():
                event_type = 'bot_detected'
                severity = 'high'
            elif 'curl' in event.user_agent.lower() or 'python' in event.user_agent.lower():
                event_type = 'suspicious_activity'
                severity = 'medium'
            
            events_data.append({
                'id': event.id,
                'type': event_type,
                'ip': event.ip_address,
                'userAgent': event.user_agent,
                'timestamp': event.timestamp.isoformat(),
                'action': 'allowed',
                'severity': severity
            })
        
        return jsonify({
            'settings': settings,
            'blockedIPs': blocked_ips_data,
            'blockedCountries': blocked_countries_data,
            'events': events_data
        })
        
    except Exception as e:
        print(f"Error fetching security data: {e}")
        return jsonify({'error': 'Failed to fetch security data'}), 500

@security_bp.route('/api/security/settings', methods=['PUT'])
@require_auth
def update_security_settings():
    """Update security settings"""
    try:
        data = request.get_json()
        
        settings = SecuritySettings.query.filter_by(user_id=g.user.id).first()
        
        if not settings:
            settings = SecuritySettings(user_id=g.user.id)
            db.session.add(settings)
        
        settings.bot_protection = data.get('botProtection', settings.bot_protection)
        settings.ip_blocking = data.get('ipBlocking', settings.ip_blocking)
        settings.rate_limiting = data.get('rateLimiting', settings.rate_limiting)
        settings.geo_blocking = data.get('geoBlocking', settings.geo_blocking)
        settings.vpn_detection = data.get('vpnDetection', settings.vpn_detection)
        settings.suspicious_activity_detection = data.get('suspiciousActivityDetection', settings.suspicious_activity_detection)
        
        db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating security settings: {e}")
        return jsonify({'error': 'Failed to update settings'}), 500

@security_bp.route('/api/security/blocked-ips', methods=['POST'])
@require_auth
def add_blocked_ip():
    """Add a new blocked IP address"""
    try:
        data = request.get_json()
        ip = data.get('ip')
        reason = data.get('reason', 'Manual block')
        
        if not ip:
            return jsonify({'error': 'IP address is required'}), 400
        
        blocked_ip = BlockedIP(user_id=g.user.id, ip_address=ip, reason=reason)
        db.session.add(blocked_ip)
        db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding blocked IP: {e}")
        return jsonify({'error': 'Failed to add blocked IP'}), 500

@security_bp.route('/api/security/blocked-ips/<ip>', methods=['DELETE'])
@require_auth
def remove_blocked_ip(ip):
    """Remove a blocked IP address"""
    try:
        blocked_ip = BlockedIP.query.filter_by(user_id=g.user.id, ip_address=ip).first()
        if blocked_ip:
            db.session.delete(blocked_ip)
            db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error removing blocked IP: {e}")
        return jsonify({'error': 'Failed to remove blocked IP'}), 500

@security_bp.route('/api/security/blocked-countries', methods=['POST'])
@require_auth
def add_blocked_country():
    """Add a new blocked country"""
    try:
        data = request.get_json()
        country = data.get('country')
        code = data.get('code', country[:2].upper() if country else '')
        reason = data.get('reason', 'Manual block')
        
        if not country:
            return jsonify({'error': 'Country is required'}), 400
        
        blocked_country = BlockedCountry(user_id=g.user.id, country=country, country_code=code, reason=reason)
        db.session.add(blocked_country)
        db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding blocked country: {e}")
        return jsonify({'error': 'Failed to add blocked country'}), 500

@security_bp.route('/api/security/blocked-countries/<country>', methods=['DELETE'])
@require_auth
def remove_blocked_country(country):
    """Remove a blocked country"""
    try:
        blocked_country = BlockedCountry.query.filter_by(user_id=g.user.id, country=country).first()
        if blocked_country:
            db.session.delete(blocked_country)
            db.session.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        db.session.rollback()
        print(f"Error removing blocked country: {e}")
        return jsonify({'error': 'Failed to remove blocked country'}), 500

@security_bp.route('/api/notifications', methods=['GET'])
@require_auth
def get_notifications():
    """Get live notifications from recent activities"""
    try:
        notifications = []
        
        # Get recent tracking events for notifications
        events = db.session.query(
            TrackingEvent.id,
            TrackingEvent.timestamp,
            TrackingEvent.ip_address,
            TrackingEvent.user_agent,
            Link.campaign_name,
            Link.short_code
        ).join(Link, TrackingEvent.link_id == Link.id)
        .filter(Link.user_id == g.user.id)
        .order_by(TrackingEvent.timestamp.desc())
        .limit(20).all()
        
        for event in events:
            message = ''
            event_type = 'new_click'
            if 'bot' in event.user_agent.lower() or 'crawler' in event.user_agent.lower():
                message = f"Bot attempt blocked on tracking link"
                event_type = 'bot_blocked'
            elif 'curl' in event.user_agent.lower() or 'python' in event.user_agent.lower():
                message = f'Suspicious activity detected on campaign "{event.campaign_name}"'
                event_type = 'suspicious_activity'
            else:
                message = f'New click detected on campaign "{event.campaign_name}"'
            
            # Calculate time ago
            event_time = event.timestamp
            now = datetime.utcnow()
            time_diff = now - event_time
            
            if time_diff.total_seconds() < 60:
                time_ago = f"{int(time_diff.total_seconds())} seconds ago"
            elif time_diff.total_seconds() < 3600:
                time_ago = f"{int(time_diff.total_seconds() // 60)} minutes ago"
            elif time_diff.total_seconds() < 86400:
                time_ago = f"{int(time_diff.total_seconds() // 3600)} hours ago"
            else:
                time_ago = f"{time_diff.days} days ago"
            
            notifications.append({
                'id': event.id,
                'message': message,
                'timestamp': event.timestamp.isoformat(),
                'timeAgo': time_ago,
                'type': event_type
            })
        
        return jsonify({
            'notifications': notifications,
            'count': len(notifications)
        })
        
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500


