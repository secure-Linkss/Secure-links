from src.models import db
from datetime import datetime

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    target_id = db.Column(db.Integer, nullable=True)
    target_type = db.Column(db.String(50), nullable=True)  # user, campaign, link, etc.
    details = db.Column(db.Text, nullable=True)  # JSON string for additional details
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to user
    actor = db.relationship('User', backref='audit_logs')

    def __repr__(self):
        return f'<AuditLog {self.id}: {self.action}>'

    def to_dict(self):
        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'actor_username': self.actor.username if self.actor else None,
            'action': self.action,
            'target_id': self.target_id,
            'target_type': self.target_type,
            'details': self.details,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


