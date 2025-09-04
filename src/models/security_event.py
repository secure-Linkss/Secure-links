from src.models.user import db
from datetime import datetime

class SecurityEvent(db.Model):
    __tablename__ = 'security_event'
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.String(500))
    risk_score = db.Column(db.Integer)
    detection_methods = db.Column(db.Text)
    fingerprint = db.Column(db.String(255))
    request_path = db.Column(db.String(255))
    action_taken = db.Column(db.String(50))
    session_id = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)



    def __repr__(self):
        return f"<SecurityEvent {self.ip_address} - {self.risk_score}>"


