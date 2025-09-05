from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .campaign import Campaign
from .link import Link
from .tracking_event import TrackingEvent
from .audit_log import AuditLog


