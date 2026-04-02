"""
Requests API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from marshmallow import ValidationError

from ..extensions import db
from ..models.request import Request, RequestStatus, RequestType
from ..models.service import Service
from ..models.block import Block
from ..models.notification import Notification
from ..models.transaction import Transaction
from ..models.user import UserRole
from ..utils.decorators import require_role, require_active_subscription, require_approved_engineer
from ..utils.pagination import get_pagination_params
from ..schemas import CreateRequestSchema

bp = Blueprint('requests', __name__)

# Schema instance
create_request_schema = CreateRequestSchema()


@bp.route('', methods=['POST'])
@jwt_required()
@require_role('customer')
def create_request():
    """Create a new service request (customer only)."""
    data = request.get_json()
    
    # Validate with marshmallow schema
    try:
        validated_data = create_request_schema.load(data)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    # Determine request type
    req_type = validated_data.get('type', RequestType.QUICK.value)
    
    # Get price from service if provided
    price = None
    service_id = validated_data.get('service_id')
    if service_id:
        service = Service.query.get(service_id)
        if service:
            price = service.base_price
    
    # Create request
    new_request = Request(
        request_number=Request.generate_request_number(),
        customer_id=current_user.id,
        service_id=service_id,
        type=req_type,
        category=validated_data.get('category'),
        description=validated_data['description'],
        location_text=validated_data['location_text'],
        location_lat=validated_data.get('location_lat'),
        location_lng=validated_data.get('location_lng'),
        price_at_request=price,
        status=RequestStatus.PENDING.value
    )
    
    db.session.add(new_request)
    
    # Create notification
    Notification.notify_request_created(current_user.id, new_request.request_number)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Request created successfully',
        'request': new_request.to_dict()
    }), 201


@bp.route('', methods=['GET'])
@jwt_required()
def get_requests():
    """Get requests based on user role (with pagination)."""
    user = current_user
    status_filter = request.args.get('status')
    page, per_page = get_pagination_params()
    
    if user.role == UserRole.CUSTOMER.value:
        # Customers see their own requests
        query = Request.query.filter_by(customer_id=user.id)
    elif user.role == UserRole.ENGINEER.value:
        # Engineers see their assigned jobs or available requests
        view = request.args.get('view', 'assigned')  # 'assigned' or 'available'
        
        if view == 'available':
            # Get blocked user IDs
            blocked_ids = Block.get_blocked_ids(user.id)
            
            # Available = pending requests from non-blocked customers
            query = Request.query.filter(
                Request.status == RequestStatus.PENDING.value,
                ~Request.customer_id.in_(blocked_ids) if blocked_ids else True
            )
        else:
            # Assigned jobs
            query = Request.query.filter_by(engineer_id=user.id)
    else:
        # Admin sees all
        query = Request.query
    
    # Apply status filter
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    # Order by creation date (newest first)
    query = query.order_by(Request.created_at.desc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'requests': [r.to_dict(include_users=True) for r in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_request(request_id):
    """Get a specific request by ID."""
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    # Check access
    user = current_user
    if user.role == UserRole.CUSTOMER.value and req.customer_id != user.id:
        return jsonify({'error': 'Access denied'}), 403
    if user.role == UserRole.ENGINEER.value and req.engineer_id != user.id and req.status != RequestStatus.PENDING.value:
        return jsonify({'error': 'Access denied'}), 403
    
    return jsonify({
        'request': req.to_dict(include_users=True)
    }), 200


@bp.route('/<int:request_id>/accept', methods=['POST'])
@jwt_required()
@require_role('engineer')
@require_approved_engineer
@require_active_subscription
def accept_request(request_id):
    """Accept a pending request (engineer only)."""
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    if not req.can_be_accepted():
        return jsonify({'error': 'This request cannot be accepted'}), 400
    
    # Check if blocked
    if Block.is_blocked(current_user.id, req.customer_id):
        return jsonify({'error': 'You cannot accept requests from this customer'}), 403
    
    # Accept the request
    req.accept(current_user.id)
    
    # Notify customer
    Notification.notify_request_accepted(
        req.customer_id, 
        current_user.name, 
        req.request_number
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Request accepted successfully',
        'request': req.to_dict(include_users=True)
    }), 200


@bp.route('/<int:request_id>/complete', methods=['POST'])
@jwt_required()
@require_role('engineer')
def complete_request(request_id):
    """Mark a request as completed (engineer only)."""
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    if req.engineer_id != current_user.id:
        return jsonify({'error': 'You are not assigned to this request'}), 403
    
    if not req.can_be_completed():
        return jsonify({'error': 'This request cannot be marked as completed'}), 400
    
    # Complete the request
    req.complete()
    
    # Create transaction
    Transaction.create_for_request(req)
    
    # Notify customer
    Notification.notify_request_completed(req.customer_id, req.request_number)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Request marked as completed',
        'request': req.to_dict(include_users=True)
    }), 200


@bp.route('/<int:request_id>', methods=['DELETE'])
@jwt_required()
@require_role('customer')
def cancel_request(request_id):
    """Cancel a request (customer only)."""
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    if req.customer_id != current_user.id:
        return jsonify({'error': 'You can only cancel your own requests'}), 403
    
    if not req.can_be_cancelled():
        return jsonify({'error': 'This request cannot be cancelled'}), 400
    
    req.cancel()
    db.session.commit()
    
    return jsonify({
        'message': 'Request cancelled successfully',
        'request': req.to_dict()
    }), 200


@bp.route('/<int:request_id>/resend', methods=['POST'])
@jwt_required()
@require_role('customer')
def resend_request(request_id):
    """Resend a cancelled request (customer only)."""
    req = Request.query.get(request_id)
    
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    if req.customer_id != current_user.id:
        return jsonify({'error': 'You can only resend your own requests'}), 403
    
    if req.status != RequestStatus.CANCELLED.value:
        return jsonify({'error': 'Only cancelled requests can be resent'}), 400
    
    # Reset to pending
    req.status = RequestStatus.PENDING.value
    req.engineer_id = None
    req.accepted_at = None
    req.completed_at = None
    req.cancelled_at = None
    
    db.session.commit()
    
    return jsonify({
        'message': 'Request resent successfully',
        'request': req.to_dict()
    }), 200
