
from datetime import datetime
from src.models import db

class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    price = db.Column(db.Float, nullable=False)
    billing_cycle = db.Column(db.String(20), nullable=False) # e.g., 'weekly', 'monthly'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Subscription {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'billing_cycle': self.billing_cycle,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


