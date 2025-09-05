from flask import Blueprint, request, jsonify, session
from functools import wraps
from src.models import db
from src.models.user import User
from src.models.audit_log import AuditLog

admin_settings_bp = Blueprint('admin_settings', __name__)

def login_required(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return f(user, *args, **kwargs)
    return decorated_function

def log_admin_action(actor_id, action, target_id=None, target_type=None):
    """Log admin actions to audit_logs"""
    audit_log = AuditLog(
        actor_id=actor_id,
        action=action,
        target_id=target_id,
        target_type=target_type
    )
    db.session.add(audit_log)
    db.session.commit()

@admin_settings_bp.route('/password', methods=['PATCH'])
@login_required
def change_password(current_user):
    """Change user's password"""
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')
    
    if not all([current_password, new_password, confirm_password]):
        return jsonify({'error': 'All password fields are required'}), 400
    
    # Verify current password
    if not current_user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400
    
    # Validate new password
    if new_password != confirm_password:
        return jsonify({'error': 'New passwords do not match'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    
    # Update password
    current_user.set_password(new_password)
    db.session.commit()
    
    # Log action
    log_admin_action(current_user.id, f"Changed password", current_user.id, 'user')
    
    return jsonify({'message': 'Password changed successfully'})

@admin_settings_bp.route('/profile', methods=['PATCH'])
@login_required
def update_profile(current_user):
    """Update user's profile"""
    data = request.get_json()
    
    # Main Admin username is fixed
    if current_user.role == 'main_admin' and 'username' in data:
        return jsonify({'error': 'Main admin username cannot be changed'}), 403
    
    # Update allowed fields
    if 'email' in data and current_user.role != 'main_admin':
        # Check if email already exists
        existing_user = User.query.filter(User.email == data['email'], User.id != current_user.id).first()
        if existing_user:
            return jsonify({'error': 'Email already exists'}), 400
        current_user.email = data['email']
    
    if 'username' in data and current_user.role != 'main_admin':
        # Check if username already exists
        existing_user = User.query.filter(User.username == data['username'], User.id != current_user.id).first()
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 400
        current_user.username = data['username']
    
    # Update other profile fields
    if 'telegram_bot_token' in data:
        current_user.telegram_bot_token = data['telegram_bot_token']
    if 'telegram_chat_id' in data:
        current_user.telegram_chat_id = data['telegram_chat_id']
    if 'telegram_enabled' in data:
        current_user.telegram_enabled = data['telegram_enabled']
    
    db.session.commit()
    
    # Log action
    log_admin_action(current_user.id, f"Updated profile", current_user.id, 'user')
    
    return jsonify(current_user.to_dict())

@admin_settings_bp.route('/profile', methods=['GET'])
@login_required
def get_profile(current_user):
    """Get user's profile"""
    return jsonify(current_user.to_dict(include_sensitive=True))

