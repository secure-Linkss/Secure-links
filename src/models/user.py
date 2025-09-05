from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date
import jwt
import os
from src.models import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    settings = db.Column(db.Text, nullable=True)  # JSON string for user settings
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # New fields for roles and tracking
    role = db.Column(db.Enum('main_admin', 'admin', 'member', name='user_roles'), default='member')
    last_login = db.Column(db.DateTime)
    last_ip = db.Column(db.String(45))
    login_count = db.Column(db.Integer, default=0)
    failed_login_attempts = db.Column(db.Integer, default=0)
    account_locked_until = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)

    # Subscription and usage
    plan_type = db.Column(db.String(20), default='free')  # free, pro, enterprise
    subscription_expiry = db.Column(db.DateTime, nullable=True)  # Subscription expiry date
    subscription_plan = db.Column(db.String(50), default='1 Day Trial')  # Plan name
    subscription_start = db.Column(db.DateTime, nullable=True)  # Subscription start date
    subscription_end = db.Column(db.DateTime, nullable=True)  # Subscription end date
    status = db.Column(db.Enum('pending', 'active', 'suspended', 'expired', name='user_status'), default='pending')
    campaigns_count = db.Column(db.Integer, default=0)  # Number of campaigns assigned
    daily_link_limit = db.Column(db.Integer, default=10)
    links_used_today = db.Column(db.Integer, default=0)
    last_reset_date = db.Column(db.Date, default=date.today())

    # Telegram integration fields
    telegram_bot_token = db.Column(db.String(255), nullable=True)
    telegram_chat_id = db.Column(db.String(100), nullable=True)
    telegram_enabled = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role in ['admin', 'assistant_admin']

    def can_create_link(self):
        if self.plan_type == 'pro' or self.plan_type == 'enterprise':
            return True
        
        # Reset daily count if new day
        today = date.today()
        if self.last_reset_date != today:
            self.links_used_today = 0
            self.last_reset_date = today
            db.session.commit()
        
        return self.links_used_today < self.daily_link_limit
    
    def increment_link_usage(self):
        self.links_used_today += 1
        db.session.commit()

    def generate_token(self):
        """Generate JWT token for API authentication"""
        payload = {
            'user_id': self.id,
            'exp': datetime.utcnow() + datetime.timedelta(days=30)
        }
        return jwt.encode(payload, os.environ.get('SECRET_KEY', 'ej5B3Amppi4gjpbC65te6rJuvJzgVCWW_xfB-ZLR1TE'), algorithm='HS256')

    @staticmethod
    def verify_token(token):
        """Verify JWT token and return user"""
        try:
            payload = jwt.decode(token, os.environ.get('SECRET_KEY', 'ej5B3Amppi4gjpbC65te6rJuvJzgVCWW_xfB-ZLR1TE'), algorithms=['HS256'])
            return User.query.get(payload['user_id'])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def update_status_based_on_subscription(self):
        """Update user status based on subscription expiry"""
        if self.role in ['main_admin', 'admin']:
            # Admins always have active status and lifetime subscription
            self.status = 'active'
            return
        
        if self.subscription_end:
            now = datetime.utcnow()
            if now > self.subscription_end and self.status != 'suspended':
                self.status = 'expired'
            elif now <= self.subscription_end and self.status == 'expired':
                self.status = 'active'

    def get_subscription_plan_display(self):
        """Get display name for subscription plan"""
        if self.role in ['main_admin', 'admin']:
            return 'Lifetime'
        return self.subscription_plan or '1 Day Trial'

    def get_remaining_days(self):
        """Get remaining subscription days"""
        if self.role in ['main_admin', 'admin']:
            return 'Lifetime'
        
        if not self.subscription_end:
            return 0
        
        now = datetime.utcnow()
        if now > self.subscription_end:
            return 0
        
        remaining = (self.subscription_end - now).days
        return max(0, remaining)

    def to_dict(self, include_sensitive=False):
        # Update status before returning data
        self.update_status_based_on_subscription()
        
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'role': self.role,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'plan_type': self.plan_type,
            'subscription_expiry': self.subscription_expiry.isoformat() if self.subscription_expiry else None,
            'subscription_plan': self.get_subscription_plan_display(),
            'subscription_start': self.subscription_start.isoformat() if self.subscription_start else None,
            'subscription_end': self.subscription_end.isoformat() if self.subscription_end else None,
            'status': self.status,
            'campaigns_count': self.campaigns_count,
            'daily_link_limit': self.daily_link_limit,
            'links_used_today': self.links_used_today,
            'last_reset_date': self.last_reset_date.isoformat() if self.last_reset_date else None,
            'remaining_days': self.get_remaining_days()
        }
        if include_sensitive:
            data.update({
                'last_login': self.last_login.isoformat() if self.last_login else None,
                'last_ip': self.last_ip,
                'login_count': self.login_count,
                'failed_login_attempts': self.failed_login_attempts,
                'account_locked_until': self.account_locked_until.isoformat() if self.account_locked_until else None,
            })
        return data





