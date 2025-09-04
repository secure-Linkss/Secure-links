from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import sqlite3
import os
import json

notifications_bp = Blueprint('notifications', __name__)

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'app.db')
    return sqlite3.connect(db_path)

def init_notifications_tables():
    """Initialize notifications table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create notifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'info',
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            link_id INTEGER,
            campaign_id INTEGER,
            metadata TEXT,
            FOREIGN KEY (user_id) REFERENCES user (id),
            FOREIGN KEY (link_id) REFERENCES link (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize tables on import
init_notifications_tables()

@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user notifications"""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', False, type=bool)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = '''
            SELECT id, title, message, type, is_read, created_at, link_id, campaign_id, metadata
            FROM notifications WHERE user_id = ?
        '''
        params = [user_id]
        
        if unread_only:
            query += ' AND is_read = 0'
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
        params.extend([per_page, (page - 1) * per_page])
        
        cursor.execute(query, params)
        
        notifications = []
        for row in cursor.fetchall():
            notifications.append({
                'id': row[0],
                'title': row[1],
                'message': row[2],
                'type': row[3],
                'isRead': bool(row[4]),
                'createdAt': row[5],
                'linkId': row[6],
                'campaignId': row[7],
                'metadata': json.loads(row[8]) if row[8] else None
            })
        
        # Get unread count
        cursor.execute('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0', (user_id,))
        unread_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'notifications': notifications,
            'unreadCount': unread_count,
            'page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get unread notifications count"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0', (user_id,))
        count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({'unreadCount': count})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark notification as read"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE notifications SET is_read = 1 
            WHERE id = ? AND user_id = ?
        ''', (notification_id, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE notifications SET is_read = 1 
            WHERE user_id = ? AND is_read = 0
        ''', (user_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM notifications 
            WHERE id = ? AND user_id = ?
        ''', (notification_id, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_notification(user_id, title, message, notification_type='info', link_id=None, campaign_id=None, metadata=None):
    """Create a new notification"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO notifications (user_id, title, message, type, link_id, campaign_id, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, title, message, notification_type, link_id, campaign_id, 
              json.dumps(metadata) if metadata else None))
        
        conn.commit()
        notification_id = cursor.lastrowid
        conn.close()
        
        return notification_id
        
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None

def create_click_notification(user_id, link_id, campaign_name=None):
    """Create notification for new click"""
    title = "New Click Detected"
    if campaign_name:
        message = f'New click detected on campaign "{campaign_name}"'
    else:
        message = "New click detected on your tracking link"
    
    return create_notification(user_id, title, message, 'success', link_id=link_id)

def create_security_notification(user_id, event_type, ip_address):
    """Create notification for security events"""
    title_map = {
        'bot_detected': 'Bot Attempt Blocked',
        'suspicious_activity': 'Suspicious Activity Detected',
        'rate_limit_exceeded': 'Rate Limit Exceeded',
        'vpn_detected': 'VPN/Proxy Detected',
        'ip_blocked': 'IP Address Blocked'
    }
    
    title = title_map.get(event_type, 'Security Alert')
    message = f"{title.lower()} from IP {ip_address}"
    
    return create_notification(user_id, title, message, 'warning')

def create_campaign_notification(user_id, campaign_id, milestone, count):
    """Create notification for campaign milestones"""
    title = "Campaign Milestone Reached"
    message = f'Campaign reached {count} {milestone}'
    
    return create_notification(user_id, title, message, 'info', campaign_id=campaign_id)

def create_system_notification(user_id, title, message):
    """Create system notification"""
    return create_notification(user_id, title, message, 'info')

# Auto-generate some sample notifications for demo
def generate_sample_notifications(user_id):
    """Generate sample notifications for demo purposes - DEPRECATED"""
    # This function is deprecated and should not be used in production
    # All notifications should come from real user activity
    pass

@notifications_bp.route('/notifications/generate-samples', methods=['POST'])
@jwt_required()
def generate_samples():
    """Generate sample notifications (DEPRECATED - for demo purposes only)"""
    # This endpoint is deprecated and should not be used in production
    return jsonify({'error': 'Sample notification generation is disabled in production'}), 400

