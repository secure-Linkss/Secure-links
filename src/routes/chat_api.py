from flask import Blueprint, request, jsonify, session
from functools import wraps
from datetime import datetime
from sqlalchemy import desc
from src.models.user import db
from src.models.user import User
from src.models.ticket import Ticket, TicketMessage

chat_api = Blueprint("chat_api", __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Authentication required"}), 401
        user = User.query.get(session["user_id"])
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

# User Side API
@chat_api.route("/api/chat/tickets", methods=["GET"])
@login_required
def get_user_tickets():
    user_id = session["user_id"]
    tickets = Ticket.query.filter_by(user_id=user_id).order_by(desc(Ticket.updated_at)).all()
    return jsonify([ticket.to_dict() for ticket in tickets])

@chat_api.route("/api/chat/tickets", methods=["POST"])
@login_required
def create_ticket():
    user_id = session["user_id"]
    data = request.get_json()
    subject = data.get("subject")
    initial_message = data.get("message")

    if not initial_message:
        return jsonify({"error": "Initial message is required"}), 400

    # Generate a unique ticket ID
    ticket_id_prefix = datetime.utcnow().strftime("TKT-%Y-%m-")
    last_ticket = Ticket.query.filter(Ticket.ticket_id.like(f"{ticket_id_prefix}%")).order_by(desc(Ticket.id)).first()
    if last_ticket:
        last_seq = int(last_ticket.ticket_id.split("-")[-1])
        new_seq = last_seq + 1
    else:
        new_seq = 1
    ticket_id = f"{ticket_id_prefix}{new_seq:04d}"

    ticket = Ticket(
        ticket_id=ticket_id,
        user_id=user_id,
        subject=subject or f"Support Request - {ticket_id}",
        status="open",
        priority="normal"
    )
    db.session.add(ticket)
    db.session.flush() # To get ticket.id for message

    message = TicketMessage(
        ticket_id=ticket.id,
        sender_id=user_id,
        sender_type="user",
        content=initial_message
    )
    db.session.add(message)
    db.session.commit()

    return jsonify(ticket.to_dict()), 201

@chat_api.route("/api/chat/tickets/<int:ticket_id>/messages", methods=["GET"])
@login_required
def get_ticket_messages(ticket_id):
    user_id = session["user_id"]
    ticket = Ticket.query.filter_by(id=ticket_id, user_id=user_id).first()
    if not ticket:
        return jsonify({"error": "Ticket not found or unauthorized"}), 404
    
    messages = TicketMessage.query.filter_by(ticket_id=ticket_id).order_by(TicketMessage.created_at).all()
    return jsonify([msg.to_dict() for msg in messages])

@chat_api.route("/api/chat/tickets/<int:ticket_id>/messages", methods=["POST"])
@login_required
def send_message(ticket_id):
    user_id = session["user_id"]
    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify({"error": "Message content is required"}), 400

    ticket = Ticket.query.filter_by(id=ticket_id, user_id=user_id).first()
    if not ticket:
        return jsonify({"error": "Ticket not found or unauthorized"}), 404

    message = TicketMessage(
        ticket_id=ticket.id,
        sender_id=user_id,
        sender_type="user",
        content=content
    )
    db.session.add(message)
    ticket.updated_at = datetime.utcnow() # Update ticket timestamp
    ticket.status = "open" # Reopen if user replies
    db.session.commit()

    return jsonify(message.to_dict()), 201

# Admin Side API
@chat_api.route("/api/admin/tickets", methods=["GET"])
@admin_required
def get_all_tickets():
    status_filter = request.args.get("status", "all")
    query = Ticket.query

    if status_filter != "all":
        query = query.filter_by(status=status_filter)
    
    tickets = query.order_by(desc(Ticket.updated_at)).all()
    return jsonify([ticket.to_dict() for ticket in tickets])

@chat_api.route("/api/admin/tickets/<int:ticket_id>", methods=["GET"])
@admin_required
def get_admin_ticket_details(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    messages = TicketMessage.query.filter_by(ticket_id=ticket_id).order_by(TicketMessage.created_at).all()
    ticket_dict = ticket.to_dict()
    ticket_dict["messages"] = [msg.to_dict() for msg in messages]
    return jsonify(ticket_dict)

@chat_api.route("/api/admin/tickets/<int:ticket_id>/messages", methods=["POST"])
@admin_required
def send_admin_message(ticket_id):
    admin_id = session["user_id"]
    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify({"error": "Message content is required"}), 400

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    message = TicketMessage(
        ticket_id=ticket.id,
        sender_id=admin_id,
        sender_type="admin",
        content=content
    )
    db.session.add(message)
    ticket.updated_at = datetime.utcnow() # Update ticket timestamp
    ticket.status = "pending" # Set to pending if admin replies
    db.session.commit()

    return jsonify(message.to_dict()), 201

@chat_api.route("/api/admin/tickets/<int:ticket_id>/status", methods=["PUT"])
@admin_required
def update_ticket_status(ticket_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ["open", "pending", "resolved", "closed"]:
        return jsonify({"error": "Invalid status"}), 400

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    ticket.status = status
    ticket.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(ticket.to_dict())

@chat_api.route("/api/admin/tickets/<int:ticket_id>/priority", methods=["PUT"])
@admin_required
def update_ticket_priority(ticket_id):
    data = request.get_json()
    priority = data.get("priority")

    if priority not in ["low", "normal", "high", "urgent"]:
        return jsonify({"error": "Invalid priority"}), 400

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    ticket.priority = priority
    ticket.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(ticket.to_dict())

@chat_api.route("/api/admin/tickets/<int:ticket_id>/assign", methods=["PUT"])
@admin_required
def assign_ticket(ticket_id):
    data = request.get_json()
    assigned_to_id = data.get("assigned_to_id")

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    if assigned_to_id:
        admin_user = User.query.get(assigned_to_id)
        if not admin_user or admin_user.role != "admin":
            return jsonify({"error": "Assigned user is not an admin"}), 400
        ticket.assigned_to = assigned_to_id
    else:
        ticket.assigned_to = None
    
    ticket.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify(ticket.to_dict())



