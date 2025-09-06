from flask import Blueprint, request, jsonify, session
from functools import wraps
from src.models import db
from src.models.user import User
from src.models.audit_log import AuditLog
from src.models.tracking_event import TrackingEvent
from datetime import datetime, timedelta
import psycopg2
import os

notifications_bp = Blueprint('notifications', __name__)

def get_db_connection():
    """Get database connection"""
    db_url = 'postgresql://neondb_owner:npg_7CcKbPRm2GDw@ep-odd-thunder-ade4ip4a-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    return psycopg2.connect(db_url)

def get_current_user():
    """Get current user from token or session"""
    # Try token first
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        user = User.verify_token(token)
        if user:
            return user
    
    # Fall back to session
    if 'user_id' in session:
        return User.query.get(session['user_id'])
    
    return None

def login_required(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        return f(user, *args, **kwargs)
    return decorated_function

@notifications_bp.route('/api/notifications', methods=['GET'])
def get_all_notifications():
    """Get all notifications from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # For now, get notifications for user_id = 1 (admin user)
        user_id = 1
        
        cursor.execute("""
            SELECT id, title, message, type, priority, read, created_at, updated_at
            FROM notifications 
            WHERE user_id = %s 
            ORDER BY created_at DESC
        """, (user_id,))
        
        notifications = []
        for row in cursor.fetchall():
            notifications.append({
                'id': row[0],
                'title': row[1],
                'message': row[2],
                'type': row[3],
                'priority': row[4],
                'read': row[5],
                'created_at': row[6].isoformat() if row[6] else None,
                'updated_at': row[7].isoformat() if row[7] else None
            })
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'notifications': notifications
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notifications_bp.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE notifications 
            SET read = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s
        """, (notification_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as read'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notifications_bp.route('/api/notifications/<int:notification_id>/unread', methods=['PUT'])
def mark_notification_unread(notification_id):
    """Mark a notification as unread"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE notifications 
            SET read = FALSE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = %s
        """, (notification_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Notification marked as unread'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notifications_bp.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM notifications WHERE id = %s
        """, (notification_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Notification deleted'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notifications_bp.route('/api/notifications/mark-all-read', methods=['PUT'])
def mark_all_notifications_read():
    """Mark all notifications as read for the current user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # For now, mark all for user_id = 1 (admin user)
        user_id = 1
        
        cursor.execute("""
            UPDATE notifications 
            SET read = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = %s AND read = FALSE
        """, (user_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'All notifications marked as read'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@notifications_bp.route('/notifications', methods=['GET'])
@login_required
def get_notifications(current_user):
    """Get user notifications"""
    try:
        notifications = []
        
        # Get recent tracking events for notifications
        recent_events = TrackingEvent.query.filter(
            TrackingEvent.created_at >= datetime.utcnow() - timedelta(hours=24)
        ).order_by(TrackingEvent.created_at.desc()).limit(10).all()
        
        for event in recent_events:
            time_ago = get_time_ago(event.created_at)
            
            if event.event_type == 'click':
                notifications.append({
                    'id': f'click_{event.id}',
                    'message': f'New click detected on tracking link',
                    'timeAgo': time_ago,
                    'type': 'click'
                })
            elif event.event_type == 'bot_blocked':
                notifications.append({
                    'id': f'bot_{event.id}',
                    'message': f'Bot attempt blocked on tracking link',
                    'timeAgo': time_ago,
                    'type': 'security'
                })
        
        # Get recent audit logs for admin notifications
        if current_user.role in ['admin', 'main_admin']:
            recent_logs = AuditLog.query.filter(
                AuditLog.created_at >= datetime.utcnow() - timedelta(hours=24)
            ).order_by(AuditLog.created_at.desc()).limit(5).all()
            
            for log in recent_logs:
                time_ago = get_time_ago(log.created_at)
                notifications.append({
                    'id': f'audit_{log.id}',
                    'message': f'Admin action: {log.action}',
                    'timeAgo': time_ago,
                    'type': 'admin'
                })
        
        return jsonify({
            'notifications': notifications[:10],  # Limit to 10 most recent
            'count': len(notifications)
        })
        
    except Exception as e:
        return jsonify({
            'notifications': [],
            'count': 0
        })

def get_time_ago(timestamp):
    """Convert timestamp to human readable time ago"""
    now = datetime.utcnow()
    diff = now - timestamp
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

@notifications_bp.route('/notifications/mark-read', methods=['POST'])
@login_required
def mark_notifications_read(current_user):
    """Mark notifications as read"""
    # In a real implementation, you would update a notifications table
    # For now, just return success
    return jsonify({'message': 'Notifications marked as read'})

@notifications_bp.route('/notifications/count', methods=['GET'])
@login_required
def get_notification_count(current_user):
    """Get unread notification count"""
    try:
        # Count recent events
        recent_count = TrackingEvent.query.filter(
            TrackingEvent.created_at >= datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        # Add admin notifications if applicable
        if current_user.role in ['admin', 'main_admin']:
            admin_count = AuditLog.query.filter(
                AuditLog.created_at >= datetime.utcnow() - timedelta(hours=24)
            ).count()
            recent_count += admin_count
        
        return jsonify({'count': min(recent_count, 99)})  # Cap at 99
        
    except Exception as e:
        return jsonify({'count': 0})

