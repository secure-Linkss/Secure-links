from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
import requests
import os

telegram_bp = Blueprint('telegram', __name__)

def require_auth():
    if 'user_id' not in session:
        return None
    return User.query.get(session['user_id'])

@telegram_bp.route('/api/telegram/test', methods=['POST'])
def test_telegram():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.get_json()
        bot_token = data.get('bot_token')
        chat_id = data.get('chat_id')
        
        if not bot_token or not chat_id:
            return jsonify({'error': 'Bot token and chat ID are required'}), 400
        
        # Test message
        message = "🔗 Brain Link Tracker Test\n\nTelegram notifications are working correctly!"
        
        # Send test message
        telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(telegram_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            # Save telegram settings to user
            user.telegram_bot_token = bot_token
            user.telegram_chat_id = chat_id
            user.telegram_enabled = True
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Test message sent successfully!'
            })
        else:
            error_data = response.json()
            return jsonify({
                'error': f"Telegram API error: {error_data.get('description', 'Unknown error')}"
            }), 400
            
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request timeout - please check your bot token'}), 400
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Network error: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@telegram_bp.route('/api/telegram/settings', methods=['GET', 'POST'])
def telegram_settings():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        return jsonify({
            'telegram_enabled': getattr(user, 'telegram_enabled', False),
            'telegram_chat_id': getattr(user, 'telegram_chat_id', ''),
            'has_bot_token': bool(getattr(user, 'telegram_bot_token', ''))
        })
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            user.telegram_enabled = data.get('telegram_enabled', False)
            user.telegram_chat_id = data.get('telegram_chat_id', '')
            
            if data.get('telegram_bot_token'):
                user.telegram_bot_token = data.get('telegram_bot_token')
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Telegram settings updated successfully'
            })
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Failed to update settings: {str(e)}'}), 500

def send_telegram_notification(user_id, message):
    """Send a telegram notification to a user"""
    try:
        user = User.query.get(user_id)
        if not user or not getattr(user, 'telegram_enabled', False):
            return False
        
        bot_token = getattr(user, 'telegram_bot_token', '')
        chat_id = getattr(user, 'telegram_chat_id', '')
        
        if not bot_token or not chat_id:
            return False
        
        telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(telegram_url, json=payload, timeout=5)
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error sending telegram notification: {e}")
        return False

def notify_new_click(user_id, link_title, visitor_info):
    """Send notification for new click"""
    message = f"""
🔗 <b>New Click Detected!</b>

📊 <b>Link:</b> {link_title}
🌍 <b>Location:</b> {visitor_info.get('country', 'Unknown')}
📱 <b>Device:</b> {visitor_info.get('device_type', 'Unknown')}
🕐 <b>Time:</b> {visitor_info.get('timestamp', 'Now')}
    """.strip()
    
    return send_telegram_notification(user_id, message)

def notify_email_capture(user_id, email, link_title, visitor_info):
    """Send notification for email capture"""
    message = f"""
📧 <b>Email Captured!</b>

✉️ <b>Email:</b> {email}
🔗 <b>Link:</b> {link_title}
🌍 <b>Location:</b> {visitor_info.get('country', 'Unknown')}
📱 <b>Device:</b> {visitor_info.get('device_type', 'Unknown')}
🕐 <b>Time:</b> {visitor_info.get('timestamp', 'Now')}
    """.strip()
    
    return send_telegram_notification(user_id, message)

