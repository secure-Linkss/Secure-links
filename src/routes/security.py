from flask import Blueprint, request, jsonify, g
from datetime import datetime, timedelta
import sqlite3
import json
from src.models.user import User
from functools import wraps

security_bp = Blueprint('security', __name__)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            token = token.replace('Bearer ', '')
            user = User.verify_token(token)
            if not user:
                return jsonify({'error': 'Invalid token'}), 401
            g.user = user
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

@security_bp.route('/api/security', methods=['GET'])
@require_auth
def get_security_data():
    """Get comprehensive security data including settings, blocked IPs, countries, and events"""
    try:
        conn = sqlite3.connect('src/database/app.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get security settings
        cursor.execute("""
            SELECT * FROM security_settings WHERE user_id = ?
        """, (g.user.id,))
        settings_row = cursor.fetchone()
        
        if settings_row:
            settings = dict(settings_row)
            # Convert string booleans to actual booleans
            for key in ['bot_protection', 'ip_blocking', 'rate_limiting', 'geo_blocking', 'vpn_detection', 'suspicious_activity_detection']:
                if key in settings:
                    settings[key] = bool(settings[key])
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
        cursor.execute("""
            SELECT ip_address as ip, reason, blocked_at as blockedAt, attempt_count as attempts
            FROM blocked_ips WHERE user_id = ?
            ORDER BY blocked_at DESC
        """, (g.user.id,))
        blocked_ips = [dict(row) for row in cursor.fetchall()]
        
        # Get blocked countries
        cursor.execute("""
            SELECT country, country_code as code, reason, blocked_at as blockedAt
            FROM blocked_countries WHERE user_id = ?
            ORDER BY blocked_at DESC
        """, (g.user.id,))
        blocked_countries = [dict(row) for row in cursor.fetchall()]
        
        # Get security events from tracking_events table
        cursor.execute("""
            SELECT 
                id,
                CASE 
                    WHEN user_agent LIKE '%bot%' OR user_agent LIKE '%crawler%' THEN 'bot_detected'
                    WHEN user_agent LIKE '%curl%' OR user_agent LIKE '%python%' THEN 'suspicious_activity'
                    ELSE 'normal_access'
                END as type,
                ip_address as ip,
                user_agent as userAgent,
                timestamp,
                'allowed' as action,
                CASE 
                    WHEN user_agent LIKE '%bot%' OR user_agent LIKE '%crawler%' THEN 'high'
                    WHEN user_agent LIKE '%curl%' OR user_agent LIKE '%python%' THEN 'medium'
                    ELSE 'low'
                END as severity
            FROM tracking_events 
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 50
        """, (g.user.id,))
        events = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'settings': settings,
            'blockedIPs': blocked_ips,
            'blockedCountries': blocked_countries,
            'events': events
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
        
        conn = sqlite3.connect('src/database/app.db')
        cursor = conn.cursor()
        
        # Create security_settings table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                bot_protection BOOLEAN DEFAULT 1,
                ip_blocking BOOLEAN DEFAULT 1,
                rate_limiting BOOLEAN DEFAULT 1,
                geo_blocking BOOLEAN DEFAULT 0,
                vpn_detection BOOLEAN DEFAULT 1,
                suspicious_activity_detection BOOLEAN DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Check if settings exist for user
        cursor.execute("SELECT id FROM security_settings WHERE user_id = ?", (g.user.id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing settings
            for key, value in data.items():
                column_name = key.replace('Protection', '_protection').replace('Blocking', '_blocking').replace('Limiting', '_limiting').replace('Detection', '_detection').lower()
                cursor.execute(f"""
                    UPDATE security_settings 
                    SET {column_name} = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                """, (value, g.user.id))
        else:
            # Insert new settings
            cursor.execute("""
                INSERT INTO security_settings (user_id, bot_protection, ip_blocking, rate_limiting, geo_blocking, vpn_detection, suspicious_activity_detection)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (g.user.id, 
                  data.get('botProtection', True),
                  data.get('ipBlocking', True),
                  data.get('rateLimiting', True),
                  data.get('geoBlocking', False),
                  data.get('vpnDetection', True),
                  data.get('suspiciousActivityDetection', True)))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
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
        
        conn = sqlite3.connect('src/database/app.db')
        cursor = conn.cursor()
        
        # Create blocked_ips table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blocked_ips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                ip_address TEXT NOT NULL,
                reason TEXT,
                blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                attempt_count INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        cursor.execute("""
            INSERT INTO blocked_ips (user_id, ip_address, reason)
            VALUES (?, ?, ?)
        """, (g.user.id, ip, reason))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Error adding blocked IP: {e}")
        return jsonify({'error': 'Failed to add blocked IP'}), 500

@security_bp.route('/api/security/blocked-ips/<ip>', methods=['DELETE'])
@require_auth
def remove_blocked_ip(ip):
    """Remove a blocked IP address"""
    try:
        conn = sqlite3.connect('src/database/app.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM blocked_ips 
            WHERE user_id = ? AND ip_address = ?
        """, (g.user.id, ip))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
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
        
        conn = sqlite3.connect('src/database/app.db')
        cursor = conn.cursor()
        
        # Create blocked_countries table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blocked_countries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                country TEXT NOT NULL,
                country_code TEXT,
                reason TEXT,
                blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        cursor.execute("""
            INSERT INTO blocked_countries (user_id, country, country_code, reason)
            VALUES (?, ?, ?, ?)
        """, (g.user.id, country, code, reason))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Error adding blocked country: {e}")
        return jsonify({'error': 'Failed to add blocked country'}), 500

@security_bp.route('/api/security/blocked-countries/<country>', methods=['DELETE'])
@require_auth
def remove_blocked_country(country):
    """Remove a blocked country"""
    try:
        conn = sqlite3.connect('src/database/app.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM blocked_countries 
            WHERE user_id = ? AND country = ?
        """, (g.user.id, country))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        print(f"Error removing blocked country: {e}")
        return jsonify({'error': 'Failed to remove blocked country'}), 500

@security_bp.route('/api/notifications', methods=['GET'])
@require_auth
def get_notifications():
    """Get live notifications from recent activities"""
    try:
        conn = sqlite3.connect('src/database/app.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get recent tracking events for notifications
        cursor.execute("""
            SELECT 
                te.id,
                te.timestamp,
                te.ip_address,
                te.user_agent,
                l.campaign_name,
                l.short_code,
                CASE 
                    WHEN te.user_agent LIKE '%bot%' OR te.user_agent LIKE '%crawler%' THEN 'bot_blocked'
                    WHEN te.user_agent LIKE '%curl%' OR te.user_agent LIKE '%python%' THEN 'suspicious_activity'
                    ELSE 'new_click'
                END as type
            FROM tracking_events te
            JOIN links l ON te.link_id = l.id
            WHERE te.user_id = ?
            ORDER BY te.timestamp DESC
            LIMIT 20
        """, (g.user.id,))
        
        events = cursor.fetchall()
        notifications = []
        
        for event in events:
            if event['type'] == 'bot_blocked':
                message = f"Bot attempt blocked on tracking link"
            elif event['type'] == 'suspicious_activity':
                message = f'Suspicious activity detected on campaign "{event["campaign_name"]}"'
            else:
                message = f'New click detected on campaign "{event["campaign_name"]}"'
            
            # Calculate time ago
            event_time = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
            now = datetime.now()
            time_diff = now - event_time
            
            if time_diff.seconds < 60:
                time_ago = f"{time_diff.seconds} seconds ago"
            elif time_diff.seconds < 3600:
                time_ago = f"{time_diff.seconds // 60} minutes ago"
            elif time_diff.days == 0:
                time_ago = f"{time_diff.seconds // 3600} hours ago"
            else:
                time_ago = f"{time_diff.days} days ago"
            
            notifications.append({
                'id': event['id'],
                'message': message,
                'timestamp': event['timestamp'],
                'timeAgo': time_ago,
                'type': event['type']
            })
        
        conn.close()
        
        return jsonify({
            'notifications': notifications,
            'count': len(notifications)
        })
        
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500

