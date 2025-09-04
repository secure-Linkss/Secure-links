import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from src.models.user import db, User
from src.models.link import Link
from src.models.tracking_event import TrackingEvent
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.links import links_bp
from src.routes.track import track_bp
from src.routes.events import events_bp
from src.routes.analytics import analytics_bp
from src.models.ticket import Ticket, TicketMessage
from src.models.campaign import Campaign
from src.models.subscription import Subscription
from src.models.audit_log import AuditLog
from src.models.admin_settings import AdminSettings
from src.models.security_event import SecurityEvent
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.links import links_bp
from src.routes.track import track_bp
from src.routes.events import events_bp
from src.routes.analytics import analytics_bp
from src.routes.campaigns import campaigns_bp
from src.routes.security import security_bp
from src.routes.settings import settings_bp
from src.routes.admin_api import admin_api
from src.routes.chat_api import chat_api
from src.routes.telegram import telegram_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), '..', 'src', 'static'))
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'ej5B3Amppi4gjpbC65te6rJuvJzgVCWW_xfB-ZLR1TE')

# Session configuration - Production ready
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("FLASK_ENV") == "production"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

# Enable CORS for all routes with proper session support - Production ready
allowed_origins = [
    "http://127.0.0.1:5000", 
    "http://localhost:5000",
    "https://securelinks.vercel.app",
    "https://secure-links.vercel.app",
    "https://secure-links-git-master-secure-linkss-projects.vercel.app"
]
CORS(app, supports_credentials=True, origins=allowed_origins, 
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Register blueprints
app.register_blueprint(user_bp, url_prefix="/api/user")
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(links_bp, url_prefix="/api")
app.register_blueprint(analytics_bp, url_prefix="/api")
app.register_blueprint(campaigns_bp, url_prefix="/api")
app.register_blueprint(settings_bp)
app.register_blueprint(security_bp)
app.register_blueprint(track_bp)
app.register_blueprint(events_bp)
app.register_blueprint(admin_api)
app.register_blueprint(chat_api)
app.register_blueprint(telegram_bp)

# Database configuration - Production ready with PostgreSQL support
database_url = os.environ.get("DATABASE_URL")
if database_url and ("postgresql" in database_url or "postgres" in database_url):
    # Production - PostgreSQL (Neon/Vercel)
    # Handle postgres:// vs postgresql:// URL schemes
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    print(f"Using PostgreSQL database: {database_url[:50]}...")
else:
    # Development/Testing - SQLite fallback
    os.makedirs(os.path.join(os.path.dirname(__file__), "..", "src", "database"), exist_ok=True)
    sqlite_path = f"sqlite:///{os.path.join(os.path.dirname(__file__), '..', 'src', 'database', 'brain_link_tracker.db')}"
    app.config["SQLALCHEMY_DATABASE_URI"] = sqlite_path
    print(f"Using SQLite database: {sqlite_path}")

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}
db.init_app(app)

# Initialize advanced security after database (disabled for deployment)
# security_coordinator = MasterSecurityCoordinator(app)

with app.app_context():
    db.create_all()
    # Create default admin user if not exists
    if not User.query.filter_by(username="Brain").first():
        admin_user = User(username="Brain", email="admin@brainlinktracker.com", role="admin", subscription_expiry=None)
        admin_user.set_password("Mayflower1!!")
        db.session.add(admin_user)
        db.session.commit()
        print("Default admin user \"Brain\" created.")
        
    # Create default admin settings if not exists
    if not AdminSettings.query.first():
        default_settings = [
            AdminSettings(key="btc_wallet", value="", description="Bitcoin wallet address for payments"),
            AdminSettings(key="usdt_wallet", value="", description="USDT wallet address for payments"),
            AdminSettings(key="pro_plan_price", value="200", description="Pro plan price in USD"),
            AdminSettings(key="enable_2fa", value="true", description="Enable 2FA for admins"),
            AdminSettings(key="session_timeout", value="60", description="Session timeout in minutes"),
            AdminSettings(key="data_retention", value="730", description="Data retention period in days"),
            AdminSettings(key="backup_frequency", value="daily", description="Backup frequency")
        ]
        for setting in default_settings:
            db.session.add(setting)
        db.session.commit()
        print("Default admin settings created.")

@app.route("/")
def serve_root():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    if path.startswith("api/"):
        return "API route not found", 404
    return send_from_directory(app.static_folder, path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)


