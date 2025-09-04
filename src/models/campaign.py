from datetime import datetime
from src.models.user import db

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
    # Campaign settings
    status = db.Column(db.String(20), default='active')  # active, paused, completed, archived
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    budget = db.Column(db.Float, default=0.0)
    target_clicks = db.Column(db.Integer, default=0)
    
    # Tracking
    total_clicks = db.Column(db.Integer, default=0)
    unique_clicks = db.Column(db.Integer, default=0)
    conversion_rate = db.Column(db.Float, default=0.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='campaigns')
    
    def __repr__(self):
        return f'<Campaign {self.name}>'
    
    def calculate_performance(self):
        """Calculate campaign performance metrics"""
        total_clicks = sum(link.click_count for link in self.links)
        unique_clicks = sum(link.unique_clicks for link in self.links)
        
        self.total_clicks = total_clicks
        self.unique_clicks = unique_clicks
        
        if self.target_clicks > 0:
            self.conversion_rate = (total_clicks / self.target_clicks) * 100
        
        db.session.commit()
    
    def get_top_performing_links(self, limit=5):
        """Get top performing links in this campaign"""
        return self.links.order_by(Link.click_count.desc()).limit(limit).all()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'budget': self.budget,
            'target_clicks': self.target_clicks,
            'total_clicks': self.total_clicks,
            'unique_clicks': self.unique_clicks,
            'conversion_rate': self.conversion_rate,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'link_count': self.links.count(),
            'links': [link.to_dict() for link in self.links.limit(10)]  # Limit for performance
        }

