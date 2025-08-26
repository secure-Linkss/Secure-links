from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.models.link import Link
from src.models.tracking_event import TrackingEvent
from sqlalchemy import func, desc
from datetime import datetime, timedelta
import json

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        period = request.args.get('period', '7')  # Default to 7 days
        days = int(period)
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        user_id = session['user_id']
        
        # Get user's links
        user_links = Link.query.filter_by(user_id=user_id).all()
        link_ids = [link.id for link in user_links]
        
        if not link_ids:
            # Return empty analytics if no links
            return jsonify({
                'analytics': {
                    'totalLinks': 0,
                    'totalClicks': 0,
                    'realVisitors': 0,
                    'capturedEmails': 0,
                    'activeLinks': 0,
                    'conversionRate': 0,
                    'avgClicksPerLink': 0
                },
                'campaigns': [],
                'countries': [],
                'emails': []
            })
        
        # Get tracking events for the period
        events = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= start_date
        ).all()
        
        # Calculate analytics
        total_links = len(user_links)
        total_clicks = len(events)
        real_visitors = len(set(event.ip_address for event in events))
        captured_emails = len([e for e in events if e.captured_email])
        active_links = len([link for link in user_links if link.is_active])
        conversion_rate = (captured_emails / total_clicks * 100) if total_clicks > 0 else 0
        avg_clicks_per_link = total_clicks / total_links if total_links > 0 else 0
        
        # Get country data
        country_stats = {}
        for event in events:
            country = event.country or 'Unknown'
            if country not in country_stats:
                country_stats[country] = {'clicks': 0, 'emails': 0}
            country_stats[country]['clicks'] += 1
            if event.captured_email:
                country_stats[country]['emails'] += 1
        
        # Convert to list and add flags/percentages
        country_flags = {
            'United States': '🇺🇸',
            'United Kingdom': '🇬🇧', 
            'Canada': '🇨🇦',
            'Germany': '🇩🇪',
            'France': '🇫🇷',
            'Australia': '🇦🇺',
            'Unknown': '🌍'
        }
        
        countries = []
        for country, stats in country_stats.items():
            percentage = (stats['clicks'] / total_clicks * 100) if total_clicks > 0 else 0
            countries.append({
                'country': country,
                'flag': country_flags.get(country, '🌍'),
                'clicks': stats['clicks'],
                'emails': stats['emails'],
                'percentage': round(percentage, 1),
                'code': country[:2].upper()
            })
        
        countries.sort(key=lambda x: x['clicks'], reverse=True)
        
        # Get campaign data (using links as campaigns)
        campaigns = []
        for link in user_links:
            link_events = [e for e in events if e.link_id == link.id]
            link_clicks = len(link_events)
            link_emails = len([e for e in link_events if e.captured_email])
            link_visitors = len(set(e.ip_address for e in link_events))
            link_conversion = (link_emails / link_clicks * 100) if link_clicks > 0 else 0
            
            campaigns.append({
                'id': f'camp_{link.id:03d}',
                'name': link.title or f'Campaign {link.short_code}',
                'trackingId': link.short_code,
                'status': 'active' if link.is_active else 'paused',
                'clicks': link_clicks,
                'visitors': link_visitors,
                'emails': link_emails,
                'conversionRate': round(link_conversion, 1),
                'created': link.created_at.isoformat() if link.created_at else None
            })
        
        campaigns.sort(key=lambda x: x['clicks'], reverse=True)
        
        # Get recent email captures
        email_events = [e for e in events if e.captured_email]
        email_events.sort(key=lambda x: x.timestamp, reverse=True)
        
        emails = []
        for event in email_events[:20]:  # Last 20 captures
            link = next((l for l in user_links if l.id == event.link_id), None)
            emails.append({
                'email': event.captured_email,
                'campaign': link.title if link else 'Unknown Campaign',
                'trackingId': link.short_code if link else 'Unknown',
                'country': event.country or 'Unknown',
                'captured': event.timestamp.isoformat() if event.timestamp else None
            })
        
        return jsonify({
            'analytics': {
                'totalLinks': total_links,
                'totalClicks': total_clicks,
                'realVisitors': real_visitors,
                'capturedEmails': captured_emails,
                'activeLinks': active_links,
                'conversionRate': round(conversion_rate, 1),
                'avgClicksPerLink': round(avg_clicks_per_link, 1)
            },
            'campaigns': campaigns,
            'countries': countries,
            'emails': emails
        })
        
    except Exception as e:
        print(f"Error fetching dashboard analytics: {e}")
        return jsonify({'error': 'Failed to fetch analytics'}), 500

@analytics_bp.route('/api/analytics/realtime', methods=['GET'])
def get_realtime_analytics():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        user_id = session['user_id']
        
        # Get user's links
        user_links = Link.query.filter_by(user_id=user_id).all()
        link_ids = [link.id for link in user_links]
        
        if not link_ids:
            return jsonify({
                'clicksToday': 0,
                'visitorsOnline': 0,
                'lastActivity': None,
                'topCountryToday': None
            })
        
        # Get today's events
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_events = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= today
        ).all()
        
        # Get last activity
        last_event = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids)
        ).order_by(desc(TrackingEvent.timestamp)).first()
        
        # Calculate realtime stats
        clicks_today = len(today_events)
        
        # Consider visitors "online" if they visited in the last 5 minutes
        five_minutes_ago = datetime.now() - timedelta(minutes=5)
        recent_events = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.timestamp >= five_minutes_ago
        ).all()
        visitors_online = len(set(event.ip_address for event in recent_events))
        
        # Get top country today
        country_stats = {}
        for event in today_events:
            country = event.country or 'Unknown'
            country_stats[country] = country_stats.get(country, 0) + 1
        
        top_country = max(country_stats.items(), key=lambda x: x[1])[0] if country_stats else None
        
        return jsonify({
            'clicksToday': clicks_today,
            'visitorsOnline': visitors_online,
            'lastActivity': last_event.timestamp.isoformat() if last_event and last_event.timestamp else None,
            'topCountryToday': top_country
        })
        
    except Exception as e:
        print(f"Error fetching realtime analytics: {e}")
        return jsonify({'error': 'Failed to fetch realtime analytics'}), 500

@analytics_bp.route('/api/analytics/performance', methods=['GET'])
def get_performance_data():
    if 'user_id' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        period = request.args.get('period', '7')
        days = int(period)
        
        user_id = session['user_id']
        user_links = Link.query.filter_by(user_id=user_id).all()
        link_ids = [link.id for link in user_links]
        
        if not link_ids:
            return jsonify({'performanceData': []})
        
        # Generate daily performance data
        performance_data = []
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            day_events = TrackingEvent.query.filter(
                TrackingEvent.link_id.in_(link_ids),
                TrackingEvent.timestamp >= day_start,
                TrackingEvent.timestamp < day_end
            ).all()
            
            clicks = len(day_events)
            visitors = len(set(event.ip_address for event in day_events))
            emails = len([e for e in day_events if e.captured_email])
            
            performance_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'clicks': clicks,
                'visitors': visitors,
                'emails': emails
            })
        
        performance_data.reverse()  # Oldest first
        
        return jsonify({'performanceData': performance_data})
        
    except Exception as e:
        print(f"Error fetching performance data: {e}")
        return jsonify({'error': 'Failed to fetch performance data'}), 500

