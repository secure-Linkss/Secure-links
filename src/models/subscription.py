from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    plan = db.Column(db.String(20), nullable=False)  # free, pro, enterprise
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, active, expired, cancelled
    tx_hash = db.Column(db.String(255), nullable=True)  # Blockchain transaction hash
    proof_url = db.Column(db.String(500), nullable=True)  # Screenshot or proof URL
    amount = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String(10), nullable=True)  # BTC, USDT
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    admin_notes = db.Column(db.Text, nullable=True)
    
    # Relationship
    user = db.relationship('User', backref='subscriptions')

    def __repr__(self):
        return f'<Subscription {self.id} - User {self.user_id} - {self.plan}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan': self.plan,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'tx_hash': self.tx_hash,
            'proof_url': self.proof_url,
            'amount': self.amount,
            'currency': self.currency,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'admin_notes': self.admin_notes,
            'user': self.user.to_dict() if self.user else None
        }

