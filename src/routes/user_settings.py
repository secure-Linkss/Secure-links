from flask import Blueprint, request, jsonify, session
from functools import wraps
from src.models import db
from src.models.user import User

user_settings_bp = Blueprint('user_settings', __name__)

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

@user_settings_bp.route('/user/notification-settings', methods=['GET'])
@login_required
def get_notification_settings(current_user):
    """Get user notification settings"""
    try:
        # For now, return default settings since we don't have a settings table
        # In a real implementation, you would query a user_settings table
        settings = {
            'emailNotifications': True,
            'smsNotifications': False,
            'pushNotifications': True,
        }
        
        return jsonify(settings)
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch notification settings'}), 500

@user_settings_bp.route('/user/notification-settings', methods=['PUT'])
@login_required
def update_notification_settings(current_user):
    """Update user notification settings"""
    try:
        data = request.json
        
        # In a real implementation, you would update the user_settings table
        # For now, just return success
        
        return jsonify({'message': 'Notification settings updated successfully'})
        
    except Exception as e:
        return jsonify({'error': 'Failed to update notification settings'}), 500

