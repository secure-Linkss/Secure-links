from src.models.user import db
from datetime import datetime

class SecuritySettings(db.Model):
    __tablename__ = 'security_settings'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bot_protection = db.Column(db.Boolean, default=True)
    ip_blocking = db.Column(db.Boolean, default=True)
    rate_limiting = db.Column(db.Boolean, default=True)
    geo_blocking = db.Column(db.Boolean, default=False)
    vpn_detection = db.Column(db.Boolean, default=True)
    suspicious_activity_detection = db.Column(db.Boolean, default=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='security_settings', uselist=False)

    def __repr__(self):
        return f'<SecuritySettings {self.user_id}>'

class BlockedIP(db.Model):
    __tablename__ = 'blocked_ips'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    ip_address = db.Column(db.String(45), nullable=False)
    reason = db.Column(db.String(255))
    blocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    attempt_count = db.Column(db.Integer, default=0)

    user = db.relationship('User', backref='blocked_ips')

    def __repr__(self):
        return f'<BlockedIP {self.ip_address}>'

class BlockedCountry(db.Model):
    __tablename__ = 'blocked_countries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    country = db.Column(db.String(255), nullable=False)
    country_code = db.Column(db.String(2))
    reason = db.Column(db.String(255))
    blocked_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='blocked_countries')

    def __repr__(self):
        return f'<BlockedCountry {self.country}>'


