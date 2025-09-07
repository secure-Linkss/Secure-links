from flask import Blueprint, jsonify

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("/notifications", methods=["GET"])
def get_notifications():
    """Get all notifications"""
    # For now, return an empty list of notifications
    return jsonify([])
    return jsonify([])

