from src.models.user import db
from datetime import datetime

class BotDetectionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.Text)
    fingerprint = db.Column(db.Text)
    risk_score = db.Column(db.Integer, default=0)
    detection_methods = db.Column(db.Text)  # Stored as JSON string
    action_taken = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.String(255))
    request_path = db.Column(db.Text)
    headers = db.Column(db.Text)  # Stored as JSON string

class BehavioralAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), nullable=False)
    ip_address = db.Column(db.String(45), nullable=False)
    request_count = db.Column(db.Integer, default=1)
    avg_request_interval = db.Column(db.Float, default=0.0)
    unique_paths = db.Column(db.Integer, default=1)
    suspicious_patterns = db.Column(db.Integer, default=0)
    mouse_movements = db.Column(db.Integer, default=0)
    keyboard_events = db.Column(db.Integer, default=0)
    scroll_events = db.Column(db.Integer, default=0)
    first_seen = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    risk_score = db.Column(db.Integer, default=0)

class IPReputation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), unique=True, nullable=False)
    reputation_score = db.Column(db.Integer, default=50)
    is_vpn = db.Column(db.Boolean, default=False)
    is_proxy = db.Column(db.Boolean, default=False)
    is_tor = db.Column(db.Boolean, default=False)
    country_code = db.Column(db.String(10))
    asn = db.Column(db.String(50))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)


