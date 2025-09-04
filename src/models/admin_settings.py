from datetime import datetime
from src.models.user import db

class AdminSettings(db.Model):
    __tablename__ = 'admin_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)  # payment, security, notifications, etc.
    is_sensitive = db.Column(db.Boolean, default=False)  # For wallet addresses, API keys, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    # Relationships
    updater = db.relationship('User', backref='settings_updates')
    
    def __repr__(self):
        return f'<AdminSettings {self.key}>'
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'key': self.key,
            'description': self.description,
            'category': self.category,
            'is_sensitive': self.is_sensitive,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'updated_by': self.updated_by,
            'updater': {
                'id': self.updater.id,
                'username': self.updater.username
            } if self.updater else None
        }
        
        # Only include sensitive values if explicitly requested
        if include_sensitive or not self.is_sensitive:
            data['value'] = self.value
        else:
            data['value'] = '***HIDDEN***' if self.value else None
            
        return data

