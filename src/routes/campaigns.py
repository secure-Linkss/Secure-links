from flask import Blueprint, request, jsonify, session
from src.models.user import User, db
from src.models.link import Link
from src.models.tracking_event import TrackingEvent
from sqlalchemy import func

campaigns_bp = Blueprint('campaigns', __name__)

def require_auth():
    if 'user_id' not in session:
        return None
    return User.query.get(session['user_id'])

@campaigns_bp.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        # Get all unique campaigns for the user
        campaigns_query = db.session.query(
            Link.campaign,
            func.count(Link.id).label('link_count'),
            func.sum(func.coalesce(
                db.session.query(func.count(TrackingEvent.id))
                .filter(TrackingEvent.link_id == Link.id)
                .scalar_subquery(), 0
            )).label('total_clicks'),
            func.sum(func.coalesce(
                db.session.query(func.count(TrackingEvent.id))
                .filter(TrackingEvent.link_id == Link.id, TrackingEvent.is_bot == False)
                .scalar_subquery(), 0
            )).label('real_visitors')
        ).filter(
            Link.user_id == user.id,
            Link.campaign.isnot(None),
            Link.campaign != ''
        ).group_by(Link.campaign).all()
        
        campaigns = []
        for campaign in campaigns_query:
            campaigns.append({
                'name': campaign.campaign,
                'link_count': campaign.link_count,
                'total_clicks': campaign.total_clicks or 0,
                'real_visitors': campaign.real_visitors or 0,
                'conversion_rate': round((campaign.real_visitors / campaign.total_clicks * 100) if campaign.total_clicks > 0 else 0, 2)
            })
        
        return jsonify({
            'success': True,
            'campaigns': campaigns
        })
        
    except Exception as e:
        print(f"Error fetching campaigns: {e}")
        return jsonify({'error': 'Failed to fetch campaigns'}), 500

@campaigns_bp.route('/api/analytics/campaigns', methods=['GET'])
def get_campaign_analytics():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        # Get overall campaign analytics
        user_links = Link.query.filter_by(user_id=user.id).all()
        link_ids = [link.id for link in user_links]
        
        if not link_ids:
            return jsonify({
                'totalClicks': 0,
                'realVisitors': 0,
                'botsBlocked': 0,
                'activeCampaigns': 0
            })
        
        total_clicks = TrackingEvent.query.filter(TrackingEvent.link_id.in_(link_ids)).count()
        real_visitors = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.is_bot == False
        ).count()
        bots_blocked = TrackingEvent.query.filter(
            TrackingEvent.link_id.in_(link_ids),
            TrackingEvent.is_bot == True
        ).count()
        
        active_campaigns = db.session.query(Link.campaign).filter(
            Link.user_id == user.id,
            Link.campaign.isnot(None),
            Link.campaign != '',
            Link.is_active == True
        ).distinct().count()
        
        return jsonify({
            'totalClicks': total_clicks,
            'realVisitors': real_visitors,
            'botsBlocked': bots_blocked,
            'activeCampaigns': active_campaigns
        })
        
    except Exception as e:
        print(f"Error fetching campaign analytics: {e}")
        return jsonify({'error': 'Failed to fetch analytics'}), 500


@campaigns_bp.route('/api/campaigns', methods=['POST'])
def create_campaign():
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        campaign_name = data.get('name', '').strip()
        if not campaign_name:
            return jsonify({'error': 'Campaign name is required'}), 400
        
        # Check if campaign already exists for this user
        existing_campaign = Link.query.filter_by(
            user_id=user.id,
            campaign_name=campaign_name
        ).first()
        
        if existing_campaign:
            return jsonify({'error': 'Campaign with this name already exists'}), 400
        
        # Create a placeholder link for the campaign to establish it
        # This will be replaced when actual links are created
        placeholder_link = Link(
            user_id=user.id,
            target_url="https://example.com",
            campaign_name=campaign_name,
            status="inactive"  # Mark as inactive placeholder
        )
        
        db.session.add(placeholder_link)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Campaign created successfully',
            'campaign': {
                'name': campaign_name,
                'link_count': 0,
                'total_clicks': 0,
                'real_visitors': 0,
                'conversion_rate': 0
            }
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating campaign: {e}")
        return jsonify({'error': 'Failed to create campaign'}), 500

@campaigns_bp.route('/api/campaigns/<campaign_name>', methods=['DELETE'])
def delete_campaign(campaign_name):
    user = require_auth()
    if not user:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        # Delete all links associated with this campaign
        links_to_delete = Link.query.filter_by(
            user_id=user.id,
            campaign_name=campaign_name
        ).all()
        
        if not links_to_delete:
            return jsonify({'error': 'Campaign not found'}), 404
        
        # Delete associated tracking events first
        for link in links_to_delete:
            TrackingEvent.query.filter_by(link_id=link.id).delete()
        
        # Delete the links
        Link.query.filter_by(
            user_id=user.id,
            campaign_name=campaign_name
        ).delete()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Campaign deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting campaign: {e}")
        return jsonify({'error': 'Failed to delete campaign'}), 500

