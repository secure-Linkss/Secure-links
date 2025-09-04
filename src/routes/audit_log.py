from datetime import datetime
from src.models.user import db

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    actor_role = db.Column(db.String(20), nullable=False)  # admin, assistant_admin
    action = db.Column(db.String(100), nullable=False)  # user_approved, user_suspended, campaign_deleted, etc.
    target_id = db.Column(db.Integer, nullable=True)  # ID of the affected resource
    target_type = db.Column(db.String(50), nullable=True)  # user, campaign, link, ticket, etc.
    details = db.Column(db.Text, nullable=True)  # JSON string with additional details
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    actor = db.relationship('User', backref='audit_logs')
    
    def __repr__(self):
        return f'<AuditLog {self.id} - {self.action}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'actor_role': self.actor_role,
            'action': self.action,
            'target_id': self.target_id,
            'target_type': self.target_type,
            'details': self.details,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'actor': {
                'id': self.actor.id,
                'username': self.actor.username,
                'email': self.actor.email
            } if self.actor else None
        }

