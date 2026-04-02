"""
Disputes API for FalcoElectrec
Handles complaint creation and management.
"""
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from sqlalchemy import or_

from ..extensions import db
from ..models.dispute import Dispute, DisputeAuditLog, DisputeStatus, DisputeCategory, ResolutionAction
from ..models.request import Request, RequestStatus
from ..models.user import User, UserStatus
from ..models.notification import Notification
from ..utils.decorators import require_role

bp = Blueprint('disputes', __name__)


@bp.route('', methods=['POST'])
@jwt_required()
def create_dispute():
    """
    Create a new dispute/complaint.
    
    Customer can file a dispute within 7 days of request completion.
    """
    data = request.get_json()
    
    # Validate required fields
    request_id = data.get('request_id')
    category = data.get('category')
    description = data.get('description')
    
    if not all([request_id, category, description]):
        return jsonify({'error': 'Missing required fields: request_id, category, description'}), 400
    
    # Validate category
    valid_categories = [c.value for c in DisputeCategory]
    if category not in valid_categories:
        return jsonify({
            'error': f'Invalid category. Must be one of: {", ".join(valid_categories)}'
        }), 400
    
    # Get the request
    service_request = Request.query.get(request_id)
    if not service_request:
        return jsonify({'error': 'Request not found'}), 404
    
    # Verify the user is involved in this request
    if current_user.id not in [service_request.customer_id, service_request.engineer_id]:
        return jsonify({'error': 'You are not authorized to file a dispute for this request'}), 403
    
    # Check if request is completed
    if service_request.status != RequestStatus.COMPLETED.value:
        return jsonify({'error': 'Disputes can only be filed for completed requests'}), 400
    
    # Check if within dispute window (7 days)
    if service_request.completed_at:
        dispute_deadline = service_request.completed_at + timedelta(days=Dispute.DISPUTE_WINDOW_DAYS)
        if datetime.utcnow() > dispute_deadline:
            return jsonify({
                'error': f'Dispute window has expired. Disputes must be filed within {Dispute.DISPUTE_WINDOW_DAYS} days of completion.'
            }), 400
    
    # Determine against_user_id
    if current_user.id == service_request.customer_id:
        against_user_id = service_request.engineer_id
    else:
        against_user_id = service_request.customer_id
    
    # Check for existing open dispute on this request by this user
    existing_dispute = Dispute.query.filter(
        Dispute.request_id == request_id,
        Dispute.created_by == current_user.id,
        Dispute.status.in_([DisputeStatus.OPEN.value, DisputeStatus.IN_REVIEW.value])
    ).first()
    
    if existing_dispute:
        return jsonify({
            'error': 'You already have an open dispute for this request',
            'dispute_id': existing_dispute.id
        }), 409
    
    # Create dispute
    dispute = Dispute(
        request_id=request_id,
        created_by=current_user.id,
        against_user_id=against_user_id,
        category=category,
        description=description,
        status=DisputeStatus.OPEN.value
    )
    
    db.session.add(dispute)
    db.session.flush()  # Get dispute ID
    
    # Create audit log
    DisputeAuditLog.log_action(
        dispute_id=dispute.id,
        action='created',
        performed_by=current_user.id,
        new_status=DisputeStatus.OPEN.value,
        details=f'Dispute created for request #{service_request.request_number}'
    )
    
    # Notify admin (create notification for admins)
    admins = User.query.filter_by(role='admin', status=UserStatus.ACTIVE.value).all()
    for admin in admins:
        notification = Notification(
            user_id=admin.id,
            type='dispute_created',
            title='New Dispute Filed',
            message=f'A new dispute has been filed for request #{service_request.request_number}',
            data={'dispute_id': dispute.id, 'request_id': request_id}
        )
        db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Dispute created successfully',
        'dispute': dispute.to_dict(include_users=True, include_request=True)
    }), 201


@bp.route('', methods=['GET'])
@jwt_required()
def get_my_disputes():
    """Get disputes created by or against the current user."""
    status = request.args.get('status')
    
    query = Dispute.query.filter(
        or_(
            Dispute.created_by == current_user.id,
            Dispute.against_user_id == current_user.id
        )
    )
    
    if status:
        query = query.filter(Dispute.status == status)
    
    disputes = query.order_by(Dispute.created_at.desc()).all()
    
    return jsonify({
        'disputes': [d.to_dict(include_users=True, include_request=True) for d in disputes]
    }), 200


@bp.route('/<int:dispute_id>', methods=['GET'])
@jwt_required()
def get_dispute(dispute_id):
    """Get a specific dispute."""
    dispute = Dispute.query.get_or_404(dispute_id)
    
    # Check authorization
    if not current_user.is_admin():
        if current_user.id not in [dispute.created_by, dispute.against_user_id]:
            return jsonify({'error': 'Not authorized to view this dispute'}), 403
    
    # Include audit log for admin
    data = dispute.to_dict(include_users=True, include_request=True)
    
    if current_user.is_admin():
        data['audit_logs'] = [log.to_dict() for log in dispute.audit_logs.order_by(DisputeAuditLog.created_at.asc()).all()]
    
    return jsonify({'dispute': data}), 200


@bp.route('/can-dispute/<int:request_id>', methods=['GET'])
@jwt_required()
def can_create_dispute(request_id):
    """Check if user can create a dispute for a request."""
    service_request = Request.query.get_or_404(request_id)
    
    # Check involvement
    if current_user.id not in [service_request.customer_id, service_request.engineer_id]:
        return jsonify({'can_dispute': False, 'reason': 'Not authorized'}), 200
    
    # Check status
    if service_request.status != RequestStatus.COMPLETED.value:
        return jsonify({'can_dispute': False, 'reason': 'Request is not completed'}), 200
    
    # Check time window
    if service_request.completed_at:
        dispute_deadline = service_request.completed_at + timedelta(days=Dispute.DISPUTE_WINDOW_DAYS)
        days_remaining = (dispute_deadline - datetime.utcnow()).days
        
        if datetime.utcnow() > dispute_deadline:
            return jsonify({'can_dispute': False, 'reason': 'Dispute window expired'}), 200
    else:
        days_remaining = Dispute.DISPUTE_WINDOW_DAYS
    
    # Check existing dispute
    existing = Dispute.query.filter(
        Dispute.request_id == request_id,
        Dispute.created_by == current_user.id,
        Dispute.status.in_([DisputeStatus.OPEN.value, DisputeStatus.IN_REVIEW.value])
    ).first()
    
    if existing:
        return jsonify({
            'can_dispute': False, 
            'reason': 'Already have open dispute',
            'dispute_id': existing.id
        }), 200
    
    return jsonify({
        'can_dispute': True,
        'days_remaining': max(0, days_remaining)
    }), 200
