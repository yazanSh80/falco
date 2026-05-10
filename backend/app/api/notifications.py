"""
Notifications API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from ..extensions import db
from ..models.notification import Notification

bp = Blueprint('notifications', __name__)


@bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get notifications for current user."""
    unread_only = request.args.get('unread', 'false').lower() == 'true'
    limit = request.args.get('limit', type=int)
    
    query = Notification.query.filter_by(user_id=current_user.id)
    
    if unread_only:
        query = query.filter_by(read=False)
    
    query = query.order_by(Notification.created_at.desc())
    
    if limit:
        query = query.limit(limit)
    
    notifications = query.all()
    
    # Count unread
    unread_count = Notification.query.filter_by(
        user_id=current_user.id, 
        read=False
    ).count()
    
    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200


@bp.route('/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_read(notification_id):
    """Mark a notification as read."""
    notification = Notification.query.get(notification_id)
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    if notification.user_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    notification.mark_as_read()
    db.session.commit()
    
    return jsonify({
        'message': 'Notification marked as read',
        'notification': notification.to_dict()
    }), 200


@bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read."""
    Notification.query.filter_by(
        user_id=current_user.id,
        read=False
    ).update({'read': True})
    
    db.session.commit()
    
    return jsonify({
        'message': 'All notifications marked as read'
    }), 200


@bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread notifications."""
    count = Notification.query.filter_by(
        user_id=current_user.id,
        read=False
    ).count()
    
    return jsonify({
        'unread_count': count
    }), 200
