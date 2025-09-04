from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.tracking_event import TrackingEvent
from datetime import datetime

page_tracking_bp = Blueprint('page_tracking', __name__)

@page_tracking_bp.route('/api/track/page-view', methods=['POST'])
def track_page_view():
    """Track when user reaches the landing page (on_page status)"""
    try:
        data = request.get_json()
        unique_id = data.get('uid')
        
        if not unique_id:
            return jsonify({'success': False, 'error': 'Missing unique ID'}), 400
        
        # Find the tracking event by unique_id
        event = TrackingEvent.query.filter_by(unique_id=unique_id).first()
        
        if not event:
            return jsonify({'success': False, 'error': 'Tracking event not found'}), 404
        
        # Update the event to indicate user is on the page
        event.on_page = True
        event.status = 'on_page'
        event.page_views = (event.page_views or 0) + 1
        
        # Update session duration if provided
        if 'duration' in data:
            event.session_duration = data['duration']
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Page view tracked'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@page_tracking_bp.route('/api/track/email-open', methods=['POST'])
def track_email_open():
    """Track when email is opened via pixel tracking"""
    try:
        data = request.get_json()
        unique_id = data.get('uid')
        email = data.get('email')
        
        if not unique_id:
            return jsonify({'success': False, 'error': 'Missing unique ID'}), 400
        
        # Find the tracking event by unique_id
        event = TrackingEvent.query.filter_by(unique_id=unique_id).first()
        
        if not event:
            return jsonify({'success': False, 'error': 'Tracking event not found'}), 404
        
        # Update the event to indicate email was opened
        event.email_opened = True
        if event.status == 'opened':
            event.status = 'email_opened'
        
        # Capture email if provided
        if email:
            event.captured_email = email
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Email open tracked'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@page_tracking_bp.route('/api/track/session-end', methods=['POST'])
def track_session_end():
    """Track when user session ends"""
    try:
        data = request.get_json()
        unique_id = data.get('uid')
        duration = data.get('duration', 0)
        
        if not unique_id:
            return jsonify({'success': False, 'error': 'Missing unique ID'}), 400
        
        # Find the tracking event by unique_id
        event = TrackingEvent.query.filter_by(unique_id=unique_id).first()
        
        if not event:
            return jsonify({'success': False, 'error': 'Tracking event not found'}), 404
        
        # Update session duration
        event.session_duration = duration
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Session end tracked'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

