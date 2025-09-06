from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.models.link import Link
from src.models.tracking_event import TrackingEvent
import os

events_bp = Blueprint('events', __name__)

def require_auth():
    if 'user_id' not in session:
        return None
    return User.query.get(session['user_id'])

def get_detailed_status(event):
    """Generate detailed status description based on event data"""
    if event.status == 'Blocked':
        if event.blocked_reason == 'bot_detected':
            return 'Bot detected and blocked by security filters'
        elif event.blocked_reason:
            return f'Access blocked: {event.blocked_reason}'
        else:
            return 'Access blocked by security filters'
    elif event.status == 'Bot':
        return 'Bot detected and blocked by security filters'
    elif event.status == 'Open':
        return 'User clicked the tracking link'
    elif event.status == 'Redirected':
        return 'User clicked link and was successfully redirected to target page'
    elif event.status == 'On Page':
        return 'User landed on target page and is actively browsing'
    elif event.email_opened:
        return 'Email tracking pixel loaded successfully'
    else:
        return 'Tracking event processed'

@events_bp.route('/api/events', methods=['GET'])
def get_events():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        # Get all tracking events for the user's links using SQLAlchemy
        events = db.session.query(TrackingEvent, Link.short_code).join(
            Link, TrackingEvent.link_id == Link.id
        ).filter(
            Link.user_id == user.id
        ).order_by(
            TrackingEvent.timestamp.desc()
        ).limit(1000).all()
        
        events_list = []
        for event, short_code in events:
            # Format timestamp for display
            timestamp_str = event.timestamp.strftime('%Y-%m-%d %H:%M:%S') if event.timestamp else 'Unknown'
            
            # Create location string
            location_parts = []
            if event.city and event.city != 'Unknown':
                location_parts.append(event.city)
            if event.region and event.region != 'Unknown':
                location_parts.append(event.region)
            if event.zip_code and event.zip_code != 'Unknown':
                location_parts.append(event.zip_code)
            if event.country and event.country != 'Unknown':
                location_parts.append(event.country)
            location = ', '.join(location_parts) if location_parts else 'Unknown Location'
            
            # Format browser and OS info
            browser_info = f"{event.browser or 'Unknown'}"
            if event.browser_version:
                browser_info += f" {event.browser_version}"
            
            os_info = f"{event.os or 'Unknown'}"
            if event.os_version:
                os_info += f" {event.os_version}"
            
            # Format session duration
            session_duration = "00:00:00"
            if event.session_duration:
                minutes, seconds = divmod(event.session_duration, 60)
                hours, minutes = divmod(minutes, 60)
                session_duration = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            
            events_list.append({
                'id': event.id,
                'uniqueId': event.unique_id or f"uid_{short_code}_{event.id:03d}",
                'timestamp': timestamp_str,
                'ip': event.ip_address or 'Unknown',
                'location': location,
                'zipCode': event.zip_code or 'Unknown',
                'region': event.region or 'Unknown',
                'country': event.country or 'Unknown',
                'city': event.city or 'Unknown',
                'userAgent': event.user_agent or 'Unknown',
                'browser': browser_info,
                'os': os_info,
                'device': event.device_type or 'Unknown',
                'status': event.status or 'Open',
                'detailedStatus': get_detailed_status(event),
                'linkId': short_code or f"link_{event.link_id}",
                'campaignId': f"camp_{event.link_id:03d}",
                'referrer': event.referrer or 'direct',
                'isp': event.isp or 'Unknown',
                'ispDetails': event.organization or event.isp or 'Unknown ISP',
                'emailCaptured': event.captured_email,
                'conversionValue': 0,  # This would need to be calculated based on business logic
                'sessionDuration': session_duration
            })
        
        return jsonify({
            'success': True,
            'events': events_list
        })
        
    except Exception as e:
        print(f"Error fetching events: {e}")
        return jsonify({'error': 'Failed to fetch events'}), 500

@events_bp.route('/api/pixel/<link_id>', methods=['GET'])
def pixel_tracking(link_id):
    """Handle pixel tracking requests"""
    try:
        link = Link.query.filter(Link.id == link_id).first()
        if not link:
            link = Link.query.filter(Link.short_code == link_id).first()

        if not link:
            return '', 404
        
        # Get request details
        ip_address = request.environ.get("HTTP_X_FORWARDED_FOR", request.remote_addr)
        user_agent = request.headers.get("User-Agent", "")
        uid = request.args.get("uid", "")  # Unique identifier parameter
        
        # Simulate geolocation and ISP lookup (replace with actual API calls in production)
        country = "Unknown"
        city = "Unknown"
        isp = "Unknown"
        
        # Determine status based on endpoint (for now, assume pixel hit means email opened)
        email_opened = True
        redirected = False  # This will be set to True when the user is redirected to the target URL
        on_page = False     # This would require a separate signal from the landing page
        
        # Insert tracking event
        new_event = TrackingEvent(
            link_id=link.id,
            ip_address=ip_address,
            user_agent=user_agent,
            country=country,
            city=city,
            isp=isp,
            timestamp=datetime.utcnow(),
            status="processed",
            unique_id=uid,
            email_opened=email_opened,
            redirected=redirected,
            on_page=on_page
        )
        db.session.add(new_event)
        
        # Update link statistics
        link.total_clicks = (link.total_clicks or 0) + 1
        link.real_visitors = (link.real_visitors or 0) + 1
        
        db.session.commit()
        
        # Return 1x1 transparent pixel
        pixel_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xdb\x00\x00\x00\x00IEND\xaeB`\x82'
        
        return pixel_data, 200, {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in pixel tracking: {e}")
        return '', 500

# Add pixel route with different path patterns
@events_bp.route('/p/<link_id>', methods=['GET'])
def pixel_tracking_short(link_id):
    """Alternative pixel tracking endpoint"""
    return pixel_tracking(link_id)

@events_bp.route('/pixel/<link_id>.png', methods=['GET'])
def pixel_tracking_png(link_id):
    """Pixel tracking with .png extension"""
    return pixel_tracking(link_id)


@events_bp.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        # Get the event and verify it belongs to the user
        event = TrackingEvent.query.get(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        # Check if the event belongs to a link owned by the user
        link = Link.query.get(event.link_id)
        if not link or link.user_id != user.id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Delete the event
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Event deleted successfully'})


    except Exception as e:
        db.session.rollback()
        print(f"Error deleting event: {e}")
        return jsonify({'error': 'Failed to delete event'}), 500

