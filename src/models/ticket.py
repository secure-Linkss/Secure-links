from datetime import datetime
from src.models.user import db

class Ticket(db.Model):
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.String(20), unique=True, nullable=False)  # TKT-2025-0001
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='open')  # open, pending, resolved, closed
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Admin assigned
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], overlaps="tickets,user_ticket")
    assigned_admin = db.relationship('User', foreign_keys=[assigned_to])
    messages = db.relationship('TicketMessage', backref='ticket', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Ticket {self.ticket_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'user_id': self.user_id,
            'subject': self.subject,
            'status': self.status,
            'priority': self.priority,
            'assigned_to': self.assigned_to,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'email': self.user.email
            } if self.user else None,
            'assigned_admin': {
                'id': self.assigned_admin.id,
                'username': self.assigned_admin.username,
                'email': self.assigned_admin.email
            } if self.assigned_admin else None,
            'message_count': self.messages.count(),
            'last_message': self.messages.order_by(TicketMessage.created_at.desc()).first().to_dict() if self.messages.count() > 0 else None
        }

class TicketMessage(db.Model):
    __tablename__ = 'ticket_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sender_type = db.Column(db.String(10), nullable=False)  # 'user' or 'admin'
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sender = db.relationship('User', backref='ticket_messages', overlaps="sender_user,sent_messages")
    
    def __repr__(self):
        return f'<TicketMessage {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'sender_id': self.sender_id,
            'sender_type': self.sender_type,
            'content': self.content,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'sender': {
                'id': self.sender.id,
                'username': self.sender.username,
                'email': self.sender.email
            } if self.sender else None
        }

