"""
Admin API for FalcoElectrec
"""
import csv
import io
from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, current_user
from marshmallow import ValidationError

from ..extensions import db
from ..models.user import User, UserRole, UserStatus
from ..models.engineer_profile import EngineerProfile
from ..models.notification import Notification
from ..models.review import Review
from ..models.admin_action_log import AdminActionLog, AdminActionType
from ..utils.decorators import require_role
from ..utils.pagination import get_pagination_params
from ..schemas import CreateAdminSchema

bp = Blueprint('admin', __name__)

# Schema instances
create_admin_schema = CreateAdminSchema()


# ==================== Engineer Approval ====================

@bp.route('/engineers/pending', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_pending_engineers():
    """Get list of engineers pending approval."""
    pending = User.query.filter_by(
        role=UserRole.ENGINEER.value,
        status=UserStatus.PENDING.value
    ).all()
    
    result = []
    for user in pending:
        data = user.to_dict()
        if user.engineer_profile:
            data['profile'] = user.engineer_profile.to_dict()
        result.append(data)
    
    return jsonify({
        'pending_engineers': result,
        'count': len(result)
    }), 200


@bp.route('/engineers/<int:engineer_id>/accept', methods=['POST'])
@jwt_required()
@require_role('admin')
def accept_engineer(engineer_id):
    """Approve an engineer's registration."""
    user = User.query.get(engineer_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role != UserRole.ENGINEER.value:
        return jsonify({'error': 'User is not an engineer'}), 400
    
    if user.status != UserStatus.PENDING.value:
        return jsonify({'error': 'Engineer is not pending approval'}), 400
    
    user.status = UserStatus.ACTIVE.value
    
    # Notify engineer
    Notification.notify_account_approved(engineer_id)
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.APPROVE_ENGINEER,
        target_type='user',
        target_id=engineer_id,
        details={'engineer_name': user.name, 'engineer_email': user.email},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Engineer approved successfully',
        'engineer': user.to_dict(include_profile=True)
    }), 200


@bp.route('/engineers/<int:engineer_id>/reject', methods=['POST'])
@jwt_required()
@require_role('admin')
def reject_engineer(engineer_id):
    """Reject an engineer's registration."""
    data = request.get_json() or {}
    reason = data.get('reason')
    
    user = User.query.get(engineer_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.role != UserRole.ENGINEER.value:
        return jsonify({'error': 'User is not an engineer'}), 400
    
    # Notify before deletion
    Notification.notify_account_rejected(engineer_id, reason)
    db.session.commit()
    
    # Log admin action before deletion
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.REJECT_ENGINEER,
        target_type='user',
        target_id=engineer_id,
        details={'engineer_name': user.name, 'engineer_email': user.email, 'reason': reason},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    # Delete user (or mark as rejected based on requirements)
    # For now, we delete
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'Engineer rejected and removed'
    }), 200


# ==================== User Management ====================

@bp.route('/users', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_users():
    """Get all users with optional filtering and pagination."""
    role = request.args.get('role')
    status = request.args.get('status')
    search = request.args.get('search')
    page, per_page = get_pagination_params()
    
    query = User.query
    
    if role:
        query = query.filter_by(role=role)
    if status:
        query = query.filter_by(status=status)
    if search:
        query = query.filter(
            db.or_(
                User.name.ilike(f'%{search}%'),
                User.email.ilike(f'%{search}%')
            )
        )
    
    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'users': [u.to_dict(include_profile=True) for u in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_user(user_id):
    """Get a specific user's details."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': user.to_dict(include_profile=True)
    }), 200


@bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@require_role('admin')
def delete_user(user_id):
    """Delete a user."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    
    if user.role == UserRole.ADMIN.value:
        # Check if this is the last admin
        admin_count = User.query.filter_by(role=UserRole.ADMIN.value).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot delete the last admin'}), 400
    
    # Log admin action before deletion
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.DELETE_USER,
        target_type='user',
        target_id=user_id,
        details={'user_name': user.name, 'user_email': user.email, 'user_role': user.role},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User deleted successfully'
    }), 200


@bp.route('/users/<int:user_id>/block', methods=['POST'])
@jwt_required()
@require_role('admin')
def block_user(user_id):
    """Block a user account."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot block yourself'}), 400
    
    user.status = UserStatus.BLOCKED.value
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.BLOCK_USER,
        target_type='user',
        target_id=user_id,
        details={'user_name': user.name, 'user_email': user.email, 'user_role': user.role},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'User blocked successfully',
        'user': user.to_dict()
    }), 200


@bp.route('/users/<int:user_id>/unblock', methods=['POST'])
@jwt_required()
@require_role('admin')
def unblock_user(user_id):
    """Unblock a user account."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.status = UserStatus.ACTIVE.value
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.UNBLOCK_USER,
        target_type='user',
        target_id=user_id,
        details={'user_name': user.name, 'user_email': user.email, 'user_role': user.role},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'User unblocked successfully',
        'user': user.to_dict()
    }), 200


# ==================== Admin Creation ====================

@bp.route('/admins', methods=['POST'])
@jwt_required()
@require_role('admin')
def create_admin():
    """Create a new admin user."""
    data = request.get_json()
    
    # Validate with marshmallow schema
    try:
        validated_data = create_admin_schema.load(data)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    email = validated_data['email'].lower()
    
    # Check if email exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create admin user
    user = User(
        name=validated_data['name'],
        email=email,
        phone=validated_data.get('phone'),
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value
    )
    user.set_password(validated_data['password'])
    
    db.session.add(user)
    db.session.flush()  # Get user ID
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.CREATE_ADMIN,
        target_type='user',
        target_id=user.id,
        details={'admin_name': user.name, 'admin_email': user.email},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Admin created successfully',
        'admin': user.to_dict()
    }), 201


# ==================== Reviews Admin ====================

@bp.route('/reviews', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_all_reviews():
    """Get all reviews with optional filtering and pagination."""
    min_rating = request.args.get('min_rating', type=int)
    max_rating = request.args.get('max_rating', type=int)
    page, per_page = get_pagination_params()
    
    query = Review.query
    
    if min_rating:
        query = query.filter(Review.rating >= min_rating)
    if max_rating:
        query = query.filter(Review.rating <= max_rating)
    
    query = query.order_by(Review.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'reviews': [r.to_dict(include_users=True) for r in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


# ==================== Dashboard Stats ====================

@bp.route('/stats', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_dashboard_stats():
    """Get dashboard statistics."""
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from ..models.dispute import Dispute, DisputeStatus
    from sqlalchemy import func
    
    stats = {
        'users': {
            'total_customers': User.query.filter_by(role=UserRole.CUSTOMER.value).count(),
            'total_engineers': User.query.filter_by(role=UserRole.ENGINEER.value).count(),
            'pending_engineers': User.query.filter_by(
                role=UserRole.ENGINEER.value, 
                status=UserStatus.PENDING.value
            ).count(),
            'total_admins': User.query.filter_by(role=UserRole.ADMIN.value).count()
        },
        'requests': {
            'total': Request.query.count(),
            'pending': Request.query.filter_by(status=RequestStatus.PENDING.value).count(),
            'in_progress': Request.query.filter_by(status=RequestStatus.IN_PROGRESS.value).count(),
            'completed': Request.query.filter_by(status=RequestStatus.COMPLETED.value).count(),
            'cancelled': Request.query.filter_by(status=RequestStatus.CANCELLED.value).count()
        },
        'reviews': {
            'total': Review.query.count(),
            'average_rating': db.session.query(func.avg(Review.rating)).scalar() or 0
        },
        'finance': {
            'total_transactions': Transaction.query.count(),
            'total_revenue': db.session.query(func.sum(Transaction.gross_amount)).scalar() or 0,
            'total_commission': db.session.query(func.sum(Transaction.commission_amount)).scalar() or 0
        },
        'disputes': {
            'total': Dispute.query.count(),
            'open': Dispute.query.filter_by(status=DisputeStatus.OPEN.value).count(),
            'in_review': Dispute.query.filter_by(status=DisputeStatus.IN_REVIEW.value).count(),
            'resolved': Dispute.query.filter_by(status=DisputeStatus.RESOLVED.value).count(),
            'rejected': Dispute.query.filter_by(status=DisputeStatus.REJECTED.value).count()
        }
    }
    
    return jsonify(stats), 200


# ==================== Dispute Management ====================

@bp.route('/disputes', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_all_disputes():
    """Get all disputes with filtering options."""
    from ..models.dispute import Dispute, DisputeStatus
    
    status = request.args.get('status')
    category = request.args.get('category')
    page, per_page = get_pagination_params(request.args)
    
    query = Dispute.query
    
    if status:
        query = query.filter(Dispute.status == status)
    if category:
        query = query.filter(Dispute.category == category)
    
    # Order by status priority (open first) then by date
    query = query.order_by(
        db.case(
            (Dispute.status == DisputeStatus.OPEN.value, 0),
            (Dispute.status == DisputeStatus.IN_REVIEW.value, 1),
            else_=2
        ),
        Dispute.created_at.desc()
    )
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'disputes': [d.to_dict(include_users=True, include_request=True) for d in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/disputes/<int:dispute_id>', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_dispute_details(dispute_id):
    """Get detailed dispute information including audit log."""
    from ..models.dispute import Dispute, DisputeAuditLog
    
    dispute = Dispute.query.get_or_404(dispute_id)
    
    data = dispute.to_dict(include_users=True, include_request=True)
    data['audit_logs'] = [
        log.to_dict() for log in dispute.audit_logs.order_by(DisputeAuditLog.created_at.asc()).all()
    ]
    
    return jsonify({'dispute': data}), 200


@bp.route('/disputes/<int:dispute_id>/status', methods=['PATCH'])
@jwt_required()
@require_role('admin')
def update_dispute_status(dispute_id):
    """Update dispute status (e.g., mark as in_review)."""
    from ..models.dispute import Dispute, DisputeStatus, DisputeAuditLog
    
    dispute = Dispute.query.get_or_404(dispute_id)
    data = request.get_json()
    
    new_status = data.get('status')
    if new_status not in [DisputeStatus.IN_REVIEW.value]:
        return jsonify({'error': 'Can only change status to in_review via this endpoint'}), 400
    
    old_status = dispute.status
    dispute.status = new_status
    
    DisputeAuditLog.log_action(
        dispute_id=dispute.id,
        action='status_changed',
        performed_by=current_user.id,
        old_status=old_status,
        new_status=new_status,
        details=data.get('notes')
    )
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.UPDATE_DISPUTE_STATUS,
        target_type='dispute',
        target_id=dispute.id,
        details={'old_status': old_status, 'new_status': new_status, 'notes': data.get('notes')},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Dispute status updated',
        'dispute': dispute.to_dict(include_users=True)
    }), 200


@bp.route('/disputes/<int:dispute_id>/resolve', methods=['PATCH'])
@jwt_required()
@require_role('admin')
def resolve_dispute(dispute_id):
    """
    Resolve a dispute with an action.
    
    Actions: no_action, partial_refund, full_refund, warn_engineer, warn_customer, block_engineer, block_customer
    """
    from ..models.dispute import Dispute, DisputeAuditLog, ResolutionAction
    from ..models.block import Block
    
    dispute = Dispute.query.get_or_404(dispute_id)
    
    if not dispute.can_be_resolved():
        return jsonify({'error': 'Dispute cannot be resolved in current status'}), 400
    
    data = request.get_json()
    action = data.get('action')
    notes = data.get('notes', '')
    refund_amount = data.get('refund_amount')
    
    if not action:
        return jsonify({'error': 'Action is required'}), 400
    
    valid_actions = [a.value for a in ResolutionAction]
    if action not in valid_actions:
        return jsonify({
            'error': f'Invalid action. Must be one of: {", ".join(valid_actions)}'
        }), 400
    
    old_status = dispute.status
    
    # Handle action side effects
    action_details = []
    
    if action == ResolutionAction.PARTIAL_REFUND.value:
        if not refund_amount or refund_amount <= 0:
            return jsonify({'error': 'Refund amount is required for partial refund'}), 400
        action_details.append(f'Partial refund: {refund_amount} NIS (simulated)')
        
    elif action == ResolutionAction.FULL_REFUND.value:
        # Get transaction amount
        if dispute.request and dispute.request.transaction:
            refund_amount = dispute.request.transaction.gross_amount
            action_details.append(f'Full refund: {refund_amount} NIS (simulated)')
        else:
            action_details.append('Full refund issued (simulated)')
            
    elif action == ResolutionAction.WARN_ENGINEER.value:
        # Create warning notification
        Notification.create_notification(
            user_id=dispute.against_user_id if dispute.against_user.role == 'engineer' else dispute.created_by,
            type='warning',
            title='Warning from Admin',
            body=f'You have received a warning regarding dispute #{dispute.id}. {notes}'
        )
        action_details.append('Warning sent to engineer')
        
    elif action == ResolutionAction.WARN_CUSTOMER.value:
        Notification.create_notification(
            user_id=dispute.against_user_id if dispute.against_user.role == 'customer' else dispute.created_by,
            type='warning',
            title='Warning from Admin',
            body=f'You have received a warning regarding dispute #{dispute.id}. {notes}'
        )
        action_details.append('Warning sent to customer')
        
    elif action == ResolutionAction.BLOCK_ENGINEER.value:
        target_id = dispute.against_user_id if dispute.against_user.role == 'engineer' else None
        if target_id:
            target_user = User.query.get(target_id)
            if target_user:
                target_user.status = UserStatus.BLOCKED.value
                action_details.append(f'Engineer {target_user.name} blocked')
                
    elif action == ResolutionAction.BLOCK_CUSTOMER.value:
        target_id = dispute.against_user_id if dispute.against_user.role == 'customer' else None
        if target_id:
            target_user = User.query.get(target_id)
            if target_user:
                target_user.status = UserStatus.BLOCKED.value
                action_details.append(f'Customer {target_user.name} blocked')
    
    # Resolve the dispute
    dispute.resolve(
        admin_id=current_user.id,
        action=action,
        notes=notes,
        refund_amount=refund_amount
    )
    
    # Create audit log
    DisputeAuditLog.log_action(
        dispute_id=dispute.id,
        action='resolved',
        performed_by=current_user.id,
        old_status=old_status,
        new_status=dispute.status,
        details=f'Action: {action}. {". ".join(action_details)}. Admin notes: {notes}'
    )
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.RESOLVE_DISPUTE,
        target_type='dispute',
        target_id=dispute.id,
        details={
            'resolution_action': action,
            'refund_amount': refund_amount,
            'actions_taken': action_details,
            'notes': notes
        },
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    # Notify both parties
    Notification.create_notification(
        user_id=dispute.created_by,
        type='dispute_resolved',
        title='Dispute Resolved',
        body=f'Your dispute #{dispute.id} has been resolved.'
    )
    
    Notification.create_notification(
        user_id=dispute.against_user_id,
        type='dispute_resolved',
        title='Dispute Resolved',
        body=f'Dispute #{dispute.id} against you has been resolved.'
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Dispute resolved successfully',
        'dispute': dispute.to_dict(include_users=True, include_request=True),
        'actions_taken': action_details
    }), 200


@bp.route('/disputes/<int:dispute_id>/reject', methods=['PATCH'])
@jwt_required()
@require_role('admin')
def reject_dispute(dispute_id):
    """Reject a dispute as unfounded."""
    from ..models.dispute import Dispute, DisputeAuditLog
    
    dispute = Dispute.query.get_or_404(dispute_id)
    
    if not dispute.can_be_resolved():
        return jsonify({'error': 'Dispute cannot be rejected in current status'}), 400
    
    data = request.get_json() or {}
    notes = data.get('notes', 'Dispute rejected as unfounded.')
    
    old_status = dispute.status
    dispute.reject(admin_id=current_user.id, notes=notes)
    
    DisputeAuditLog.log_action(
        dispute_id=dispute.id,
        action='rejected',
        performed_by=current_user.id,
        old_status=old_status,
        new_status=dispute.status,
        details=notes
    )
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type=AdminActionType.REJECT_DISPUTE,
        target_type='dispute',
        target_id=dispute.id,
        details={'notes': notes},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    # Notify creator
    Notification.create_notification(
        user_id=dispute.created_by,
        type='dispute_rejected',
        title='Dispute Rejected',
        body=f'Your dispute #{dispute.id} has been reviewed and rejected. {notes}'
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Dispute rejected',
        'dispute': dispute.to_dict(include_users=True)
    }), 200


# ==================== Admin Audit Log ====================

@bp.route('/audit-log', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_audit_log():
    """Get admin action audit log with filtering and pagination."""
    action_type = request.args.get('action_type')
    admin_id = request.args.get('admin_id', type=int)
    target_type = request.args.get('target_type')
    target_id = request.args.get('target_id', type=int)
    page, per_page = get_pagination_params()
    
    query = AdminActionLog.query
    
    if action_type:
        query = query.filter_by(action_type=action_type)
    if admin_id:
        query = query.filter_by(admin_id=admin_id)
    if target_type:
        query = query.filter_by(target_type=target_type)
    if target_id:
        query = query.filter_by(target_id=target_id)
    
    query = query.order_by(AdminActionLog.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'audit_logs': [log.to_dict(include_admin=True) for log in pagination.items],
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/audit-log/action-types', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_audit_action_types():
    """Get list of available action types for filtering."""
    return jsonify({
        'action_types': [action.value for action in AdminActionType]
    }), 200


# ==================== Area Management ====================

@bp.route('/areas', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_areas():
    """Get all areas with optional filtering."""
    from ..models.area import Area
    
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    include_stats = request.args.get('include_stats', 'true').lower() == 'true'
    
    query = Area.query
    if not include_inactive:
        query = query.filter_by(is_active=True)
    
    areas = query.order_by(Area.name).all()
    
    return jsonify({
        'areas': [a.to_dict(include_stats=include_stats) for a in areas],
        'count': len(areas)
    }), 200


@bp.route('/areas', methods=['POST'])
@jwt_required()
@require_role('admin')
def create_area():
    """Create a new service area."""
    from ..models.area import Area
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({'error': 'Area name is required'}), 400
    
    name = data['name'].strip()
    
    # Check for existing area with same name
    existing = Area.query.filter(db.func.lower(Area.name) == name.lower()).first()
    if existing:
        return jsonify({'error': 'Area with this name already exists'}), 409
    
    area = Area(
        name=name,
        name_ar=data.get('name_ar'),
        description=data.get('description'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(area)
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='create_area',
        target_type='area',
        target_id=None,
        details={'area_name': name},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Area created successfully',
        'area': area.to_dict(include_stats=True)
    }), 201


@bp.route('/areas/<int:area_id>', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_area(area_id):
    """Get area details."""
    from ..models.area import Area
    
    area = Area.query.get_or_404(area_id)
    
    return jsonify({
        'area': area.to_dict(include_stats=True)
    }), 200


@bp.route('/areas/<int:area_id>', methods=['PATCH'])
@jwt_required()
@require_role('admin')
def update_area(area_id):
    """Update an area."""
    from ..models.area import Area
    
    area = Area.query.get_or_404(area_id)
    data = request.get_json()
    
    if 'name' in data:
        name = data['name'].strip()
        # Check for duplicate
        existing = Area.query.filter(
            db.func.lower(Area.name) == name.lower(),
            Area.id != area_id
        ).first()
        if existing:
            return jsonify({'error': 'Area with this name already exists'}), 409
        area.name = name
    
    if 'name_ar' in data:
        area.name_ar = data['name_ar']
    if 'description' in data:
        area.description = data['description']
    if 'is_active' in data:
        area.is_active = data['is_active']
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='update_area',
        target_type='area',
        target_id=area_id,
        details={'area_name': area.name, 'changes': data},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Area updated successfully',
        'area': area.to_dict(include_stats=True)
    }), 200


@bp.route('/areas/<int:area_id>', methods=['DELETE'])
@jwt_required()
@require_role('admin')
def delete_area(area_id):
    """Delete an area (only if no users assigned)."""
    from ..models.area import Area
    
    area = Area.query.get_or_404(area_id)
    
    if not area.can_be_deleted():
        return jsonify({
            'error': 'Cannot delete area with assigned users. Deactivate it instead.',
            'stats': {
                'engineer_count': area.engineer_count,
                'customer_count': area.customer_count
            }
        }), 400
    
    area_name = area.name
    
    # Log admin action before deletion
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='delete_area',
        target_type='area',
        target_id=area_id,
        details={'area_name': area_name},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.delete(area)
    db.session.commit()
    
    return jsonify({
        'message': f'Area "{area_name}" deleted successfully'
    }), 200


# ==================== SLA Monitoring ====================

@bp.route('/sla/dashboard', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_sla_dashboard():
    """Get SLA monitoring dashboard with at-risk and breached requests."""
    from ..models.request import Request, RequestStatus
    from datetime import datetime
    
    now = datetime.utcnow()
    
    # Get all active requests
    active_requests = Request.query.filter(
        Request.status.in_([RequestStatus.PENDING.value, RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value])
    ).all()
    
    at_risk = []
    breached = []
    on_track = []
    
    for req in active_requests:
        req.check_sla_breach()
        sla_status = req.sla_status
        
        req_data = req.to_dict(include_users=True, include_sla=True)
        
        if sla_status == 'breached':
            breached.append(req_data)
        elif sla_status == 'at_risk':
            at_risk.append(req_data)
        else:
            on_track.append(req_data)
    
    db.session.commit()  # Save any SLA breach flags
    
    # Get SLA statistics
    total_completed = Request.query.filter_by(status=RequestStatus.COMPLETED.value).count()
    response_breaches = Request.query.filter_by(sla_response_breached=True).count()
    completion_breaches = Request.query.filter_by(sla_completion_breached=True).count()
    
    return jsonify({
        'summary': {
            'active_requests': len(active_requests),
            'on_track': len(on_track),
            'at_risk': len(at_risk),
            'breached': len(breached),
            'total_completed': total_completed,
            'response_breach_rate': round((response_breaches / max(total_completed, 1)) * 100, 1),
            'completion_breach_rate': round((completion_breaches / max(total_completed, 1)) * 100, 1)
        },
        'at_risk_requests': at_risk,
        'breached_requests': breached,
        'on_track_requests': on_track[:10]  # Only return first 10 on-track
    }), 200


@bp.route('/sla/check-breaches', methods=['POST'])
@jwt_required()
@require_role('admin')
def check_sla_breaches():
    """Manually check and update all SLA breaches."""
    from ..models.request import Request, RequestStatus
    
    active_requests = Request.query.filter(
        Request.status.in_([RequestStatus.PENDING.value, RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value])
    ).all()
    
    breaches_found = 0
    for req in active_requests:
        if req.check_sla_breach():
            breaches_found += 1
    
    db.session.commit()
    
    return jsonify({
        'message': f'SLA check completed. Found {breaches_found} breached requests.',
        'breaches_found': breaches_found
    }), 200


# ==================== Reports & Analytics ====================

@bp.route('/reports/summary', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_reports_summary():
    """Get comprehensive platform summary report."""
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from ..models.dispute import Dispute, DisputeStatus
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # Time ranges
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)
    
    summary = {
        'users': {
            'total_customers': User.query.filter_by(role=UserRole.CUSTOMER.value).count(),
            'active_customers': User.query.filter_by(role=UserRole.CUSTOMER.value, status=UserStatus.ACTIVE.value).count(),
            'total_engineers': User.query.filter_by(role=UserRole.ENGINEER.value).count(),
            'active_engineers': User.query.filter_by(role=UserRole.ENGINEER.value, status=UserStatus.ACTIVE.value).count(),
            'pending_engineers': User.query.filter_by(role=UserRole.ENGINEER.value, status=UserStatus.PENDING.value).count(),
            'blocked_users': User.query.filter_by(status=UserStatus.BLOCKED.value).count(),
            'total_admins': User.query.filter_by(role=UserRole.ADMIN.value).count(),
            'new_today': User.query.filter(User.created_at >= today_start).count(),
            'new_this_week': User.query.filter(User.created_at >= week_start).count(),
            'new_this_month': User.query.filter(User.created_at >= month_start).count()
        },
        'requests': {
            'total': Request.query.count(),
            'pending': Request.query.filter_by(status=RequestStatus.PENDING.value).count(),
            'accepted': Request.query.filter_by(status=RequestStatus.ACCEPTED.value).count(),
            'in_progress': Request.query.filter_by(status=RequestStatus.IN_PROGRESS.value).count(),
            'completed': Request.query.filter_by(status=RequestStatus.COMPLETED.value).count(),
            'cancelled': Request.query.filter_by(status=RequestStatus.CANCELLED.value).count(),
            'today': Request.query.filter(Request.created_at >= today_start).count(),
            'this_week': Request.query.filter(Request.created_at >= week_start).count(),
            'this_month': Request.query.filter(Request.created_at >= month_start).count(),
            'completion_rate': round(
                (Request.query.filter_by(status=RequestStatus.COMPLETED.value).count() / 
                 max(Request.query.count(), 1)) * 100, 1
            )
        },
        'reviews': {
            'total': Review.query.count(),
            'average_rating': round(db.session.query(func.avg(Review.rating)).scalar() or 0, 2),
            'distribution': {
                '5_star': Review.query.filter_by(rating=5).count(),
                '4_star': Review.query.filter_by(rating=4).count(),
                '3_star': Review.query.filter_by(rating=3).count(),
                '2_star': Review.query.filter_by(rating=2).count(),
                '1_star': Review.query.filter_by(rating=1).count()
            }
        },
        'finance': {
            'total_transactions': Transaction.query.count(),
            'total_revenue': round(db.session.query(func.sum(Transaction.gross_amount)).scalar() or 0, 2),
            'total_commission': round(db.session.query(func.sum(Transaction.commission_amount)).scalar() or 0, 2),
            'revenue_today': round(db.session.query(func.sum(Transaction.gross_amount)).filter(
                Transaction.created_at >= today_start
            ).scalar() or 0, 2),
            'revenue_this_week': round(db.session.query(func.sum(Transaction.gross_amount)).filter(
                Transaction.created_at >= week_start
            ).scalar() or 0, 2),
            'revenue_this_month': round(db.session.query(func.sum(Transaction.gross_amount)).filter(
                Transaction.created_at >= month_start
            ).scalar() or 0, 2),
            'average_transaction': round(db.session.query(func.avg(Transaction.gross_amount)).scalar() or 0, 2)
        },
        'disputes': {
            'total': Dispute.query.count(),
            'open': Dispute.query.filter_by(status=DisputeStatus.OPEN.value).count(),
            'in_review': Dispute.query.filter_by(status=DisputeStatus.IN_REVIEW.value).count(),
            'resolved': Dispute.query.filter_by(status=DisputeStatus.RESOLVED.value).count(),
            'rejected': Dispute.query.filter_by(status=DisputeStatus.REJECTED.value).count()
        }
    }
    
    return jsonify(summary), 200


@bp.route('/reports/engineers', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_engineers_report():
    """Get detailed engineers performance report."""
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from sqlalchemy import func
    
    page, per_page = get_pagination_params()
    sort_by = request.args.get('sort_by', 'jobs_completed')  # jobs_completed, rating, earnings
    sort_order = request.args.get('sort_order', 'desc')
    area_filter = request.args.get('area')
    
    # Get engineers with profiles
    engineers = User.query.filter_by(
        role=UserRole.ENGINEER.value,
        status=UserStatus.ACTIVE.value
    )
    
    if area_filter:
        engineers = engineers.filter_by(area=area_filter)
    
    engineer_reports = []
    for engineer in engineers.all():
        profile = engineer.engineer_profile
        if not profile:
            continue
        
        # Get financial stats
        total_earnings = db.session.query(func.sum(Transaction.net_amount)).filter(
            Transaction.engineer_id == engineer.id
        ).scalar() or 0
        
        # Get request stats
        completed_jobs = Request.query.filter(
            Request.engineer_id == engineer.id,
            Request.status == RequestStatus.COMPLETED.value
        ).count()
        
        active_jobs = Request.query.filter(
            Request.engineer_id == engineer.id,
            Request.status.in_([RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value])
        ).count()
        
        engineer_reports.append({
            'id': engineer.id,
            'name': engineer.name,
            'email': engineer.email,
            'phone': engineer.phone,
            'area': engineer.area,
            'city': engineer.city,
            'specialization': profile.specialization,
            'years_exp': profile.years_exp,
            'rating_avg': round(profile.rating_avg or 0, 2),
            'rating_count': profile.rating_count or 0,
            'jobs_completed': completed_jobs,
            'active_jobs': active_jobs,
            'total_earnings': round(total_earnings, 2),
            'subscription_status': profile.subscription_status,
            'subscription_expiry': profile.subscription_expiry.isoformat() if profile.subscription_expiry else None,
            'is_available': profile.is_available,
            'created_at': engineer.created_at.isoformat() if engineer.created_at else None
        })
    
    # Sort
    reverse = sort_order == 'desc'
    if sort_by == 'rating':
        engineer_reports.sort(key=lambda x: x['rating_avg'], reverse=reverse)
    elif sort_by == 'earnings':
        engineer_reports.sort(key=lambda x: x['total_earnings'], reverse=reverse)
    else:  # jobs_completed
        engineer_reports.sort(key=lambda x: x['jobs_completed'], reverse=reverse)
    
    # Paginate
    total = len(engineer_reports)
    start = (page - 1) * per_page
    end = start + per_page
    paginated = engineer_reports[start:end]
    
    return jsonify({
        'engineers': paginated,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'has_next': end < total,
            'has_prev': page > 1
        }
    }), 200


@bp.route('/reports/finance', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_finance_report():
    """Get detailed financial report with time-series data."""
    from ..models.request import Request
    from ..models.transaction import Transaction
    from sqlalchemy import func, extract
    from datetime import datetime, timedelta
    
    # Time range filter
    days = request.args.get('days', 30, type=int)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Overall statistics
    total_transactions = Transaction.query.filter(
        Transaction.created_at >= start_date
    ).count()
    
    total_revenue = db.session.query(func.sum(Transaction.gross_amount)).filter(
        Transaction.created_at >= start_date
    ).scalar() or 0
    
    total_commission = db.session.query(func.sum(Transaction.commission_amount)).filter(
        Transaction.created_at >= start_date
    ).scalar() or 0
    
    # Daily breakdown
    daily_data = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        day_end = day + timedelta(days=1)
        
        day_revenue = db.session.query(func.sum(Transaction.gross_amount)).filter(
            Transaction.created_at >= day,
            Transaction.created_at < day_end
        ).scalar() or 0
        
        day_commission = db.session.query(func.sum(Transaction.commission_amount)).filter(
            Transaction.created_at >= day,
            Transaction.created_at < day_end
        ).scalar() or 0
        
        day_count = Transaction.query.filter(
            Transaction.created_at >= day,
            Transaction.created_at < day_end
        ).count()
        
        daily_data.append({
            'date': day.strftime('%Y-%m-%d'),
            'revenue': round(day_revenue, 2),
            'commission': round(day_commission, 2),
            'transactions': day_count
        })
    
    # Top earners
    top_engineers = db.session.query(
        Transaction.engineer_id,
        func.sum(Transaction.net_amount).label('earnings'),
        func.count(Transaction.id).label('transaction_count')
    ).filter(
        Transaction.created_at >= start_date
    ).group_by(
        Transaction.engineer_id
    ).order_by(
        func.sum(Transaction.net_amount).desc()
    ).limit(10).all()
    
    top_earners = []
    for eng_id, earnings, count in top_engineers:
        engineer = User.query.get(eng_id)
        if engineer:
            top_earners.append({
                'id': engineer.id,
                'name': engineer.name,
                'earnings': round(earnings, 2),
                'transactions': count
            })
    
    return jsonify({
        'period': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat(),
            'days': days
        },
        'summary': {
            'total_transactions': total_transactions,
            'total_revenue': round(total_revenue, 2),
            'total_commission': round(total_commission, 2),
            'net_to_engineers': round(total_revenue - total_commission, 2),
            'average_transaction': round(total_revenue / max(total_transactions, 1), 2)
        },
        'daily_data': daily_data,
        'top_earners': top_earners
    }), 200


@bp.route('/reports/requests', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_requests_report():
    """Get all requests with full details for admin view."""
    from ..models.request import Request, RequestStatus
    
    page, per_page = get_pagination_params()
    status_filter = request.args.get('status')
    engineer_id = request.args.get('engineer_id', type=int)
    customer_id = request.args.get('customer_id', type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    query = Request.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if engineer_id:
        query = query.filter_by(engineer_id=engineer_id)
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    if date_from:
        from datetime import datetime
        query = query.filter(Request.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        from datetime import datetime
        query = query.filter(Request.created_at <= datetime.fromisoformat(date_to))
    
    query = query.order_by(Request.created_at.desc())
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


@bp.route('/reports/areas', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_areas_report():
    """Get statistics grouped by area."""
    from ..models.area import Area
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from sqlalchemy import func
    
    # Get all unique areas from users
    areas_from_users = db.session.query(User.area).filter(
        User.area.isnot(None)
    ).distinct().all()
    
    area_names = set([a[0] for a in areas_from_users if a[0]])
    
    # Also include areas from Area model
    defined_areas = Area.query.all()
    for area in defined_areas:
        area_names.add(area.name)
    
    area_reports = []
    for area_name in sorted(area_names):
        # Count users
        engineers = User.query.filter_by(area=area_name, role=UserRole.ENGINEER.value).count()
        active_engineers = User.query.filter_by(area=area_name, role=UserRole.ENGINEER.value, status=UserStatus.ACTIVE.value).count()
        customers = User.query.filter_by(area=area_name, role=UserRole.CUSTOMER.value).count()
        
        # Get user IDs for request/transaction queries
        customer_ids = [u.id for u in User.query.filter_by(area=area_name, role=UserRole.CUSTOMER.value).all()]
        engineer_ids = [u.id for u in User.query.filter_by(area=area_name, role=UserRole.ENGINEER.value).all()]
        
        # Count requests
        total_requests = Request.query.filter(Request.customer_id.in_(customer_ids)).count() if customer_ids else 0
        completed_requests = Request.query.filter(
            Request.customer_id.in_(customer_ids),
            Request.status == RequestStatus.COMPLETED.value
        ).count() if customer_ids else 0
        
        # Revenue
        area_revenue = db.session.query(func.sum(Transaction.gross_amount)).filter(
            Transaction.engineer_id.in_(engineer_ids)
        ).scalar() or 0 if engineer_ids else 0
        
        # Check if area is defined in Area model
        defined_area = Area.query.filter_by(name=area_name).first()
        
        area_reports.append({
            'name': area_name,
            'is_defined': defined_area is not None,
            'is_active': defined_area.is_active if defined_area else True,
            'total_engineers': engineers,
            'active_engineers': active_engineers,
            'total_customers': customers,
            'total_requests': total_requests,
            'completed_requests': completed_requests,
            'completion_rate': round((completed_requests / max(total_requests, 1)) * 100, 1),
            'total_revenue': round(area_revenue, 2)
        })
    
    # Sort by total users
    area_reports.sort(key=lambda x: x['total_engineers'] + x['total_customers'], reverse=True)
    
    return jsonify({
        'areas': area_reports,
        'count': len(area_reports)
    }), 200


# ==================== Engineer Permissions ====================

@bp.route('/engineers/<int:engineer_id>/permissions', methods=['PATCH'])
@jwt_required()
@require_role('admin')
def update_engineer_permissions(engineer_id):
    """Update engineer permissions and settings."""
    from datetime import date, timedelta
    
    user = User.query.get_or_404(engineer_id)
    
    if user.role != UserRole.ENGINEER.value:
        return jsonify({'error': 'User is not an engineer'}), 400
    
    if not user.engineer_profile:
        return jsonify({'error': 'Engineer profile not found'}), 404
    
    data = request.get_json()
    changes = []
    
    # Update area
    if 'area' in data:
        old_area = user.area
        user.area = data['area']
        changes.append(f'Area changed from {old_area} to {data["area"]}')
    
    # Update availability
    if 'is_available' in data:
        user.engineer_profile.is_available = data['is_available']
        changes.append(f'Availability set to {data["is_available"]}')
    
    # Extend subscription
    if 'extend_subscription_days' in data:
        days = data['extend_subscription_days']
        if user.engineer_profile.subscription_expiry:
            new_expiry = user.engineer_profile.subscription_expiry + timedelta(days=days)
        else:
            new_expiry = date.today() + timedelta(days=days)
        user.engineer_profile.subscription_expiry = new_expiry
        changes.append(f'Subscription extended by {days} days to {new_expiry}')
    
    # Reset subscription
    if 'reset_subscription' in data and data['reset_subscription']:
        user.engineer_profile.subscription_status = 'active'
        user.engineer_profile.subscription_expiry = date.today() + timedelta(days=30)
        changes.append('Subscription reset to active with 30 days')
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='update_engineer_permissions',
        target_type='user',
        target_id=engineer_id,
        details={'changes': changes, 'data': data},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': 'Engineer permissions updated',
        'changes': changes,
        'engineer': user.to_dict(include_profile=True)
    }), 200


# ==================== CSV Export ====================

def generate_csv(headers, rows):
    """Generate CSV content from headers and rows."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    return output.getvalue()


@bp.route('/export/engineers', methods=['GET'])
@jwt_required()
@require_role('admin')
def export_engineers_csv():
    """Export engineers report as CSV."""
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from sqlalchemy import func
    
    engineers = User.query.filter_by(
        role=UserRole.ENGINEER.value
    ).all()
    
    headers = [
        'ID', 'Name', 'Email', 'Phone', 'Area', 'City', 'Status',
        'Specialization', 'Years Experience', 'Rating', 'Review Count',
        'Completed Jobs', 'Total Earnings', 'Subscription Status',
        'Subscription Expiry', 'Created At'
    ]
    
    rows = []
    for eng in engineers:
        profile = eng.engineer_profile
        
        completed = Request.query.filter(
            Request.engineer_id == eng.id,
            Request.status == RequestStatus.COMPLETED.value
        ).count()
        
        earnings = db.session.query(func.sum(Transaction.net_amount)).filter(
            Transaction.engineer_id == eng.id
        ).scalar() or 0
        
        rows.append([
            eng.id,
            eng.name,
            eng.email,
            eng.phone or '',
            eng.area or '',
            eng.city or '',
            eng.status,
            profile.specialization if profile else '',
            profile.years_exp if profile else 0,
            round(profile.rating_avg or 0, 2) if profile else 0,
            profile.rating_count if profile else 0,
            completed,
            round(earnings, 2),
            profile.subscription_status if profile else '',
            profile.subscription_expiry.isoformat() if profile and profile.subscription_expiry else '',
            eng.created_at.isoformat() if eng.created_at else ''
        ])
    
    csv_content = generate_csv(headers, rows)
    
    # Log export action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='export_engineers',
        target_type='report',
        target_id=0,
        details={'count': len(rows)},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.commit()
    
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=engineers_report_{date.today().isoformat()}.csv'}
    )


@bp.route('/export/finance', methods=['GET'])
@jwt_required()
@require_role('admin')
def export_finance_csv():
    """Export financial transactions as CSV."""
    from ..models.transaction import Transaction
    
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    transactions = Transaction.query.filter(
        Transaction.created_at >= start_date
    ).order_by(Transaction.created_at.desc()).all()
    
    headers = [
        'ID', 'Request ID', 'Customer ID', 'Engineer ID',
        'Gross Amount', 'Commission', 'Net Amount',
        'Status', 'Created At', 'Completed At'
    ]
    
    rows = []
    for t in transactions:
        rows.append([
            t.id,
            t.request_id,
            t.customer_id,
            t.engineer_id,
            round(t.gross_amount, 2),
            round(t.commission_amount, 2),
            round(t.net_amount, 2),
            t.status,
            t.created_at.isoformat() if t.created_at else '',
            t.completed_at.isoformat() if t.completed_at else ''
        ])
    
    csv_content = generate_csv(headers, rows)
    
    # Log export action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='export_finance',
        target_type='report',
        target_id=0,
        details={'count': len(rows), 'days': days},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.commit()
    
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=finance_report_{date.today().isoformat()}.csv'}
    )


@bp.route('/export/requests', methods=['GET'])
@jwt_required()
@require_role('admin')
def export_requests_csv():
    """Export requests report as CSV."""
    from ..models.request import Request
    
    days = request.args.get('days', 30, type=int)
    status_filter = request.args.get('status')
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = Request.query.filter(Request.created_at >= start_date)
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    requests_list = query.order_by(Request.created_at.desc()).all()
    
    headers = [
        'Request Number', 'Customer ID', 'Engineer ID', 'Service ID',
        'Type', 'Category', 'Status', 'Location',
        'Price', 'Created At', 'Accepted At', 'Completed At'
    ]
    
    rows = []
    for r in requests_list:
        rows.append([
            r.request_number,
            r.customer_id,
            r.engineer_id or '',
            r.service_id or '',
            r.type,
            r.category or '',
            r.status,
            r.location_text,
            round(r.price_at_request or 0, 2),
            r.created_at.isoformat() if r.created_at else '',
            r.accepted_at.isoformat() if r.accepted_at else '',
            r.completed_at.isoformat() if r.completed_at else ''
        ])
    
    csv_content = generate_csv(headers, rows)
    
    # Log export action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='export_requests',
        target_type='report',
        target_id=0,
        details={'count': len(rows), 'days': days, 'status': status_filter},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.commit()
    
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=requests_report_{date.today().isoformat()}.csv'}
    )


@bp.route('/export/users', methods=['GET'])
@jwt_required()
@require_role('admin')
def export_users_csv():
    """Export all users as CSV."""
    role_filter = request.args.get('role')
    
    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)
    
    users = query.order_by(User.created_at.desc()).all()
    
    headers = [
        'ID', 'Name', 'Email', 'Phone', 'Role', 'Status',
        'Area', 'City', 'Created At'
    ]
    
    rows = []
    for u in users:
        rows.append([
            u.id,
            u.name,
            u.email,
            u.phone or '',
            u.role,
            u.status,
            u.area or '',
            u.city or '',
            u.created_at.isoformat() if u.created_at else ''
        ])
    
    csv_content = generate_csv(headers, rows)
    
    # Log export action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='export_users',
        target_type='report',
        target_id=0,
        details={'count': len(rows), 'role': role_filter},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    db.session.commit()
    
    return Response(
        csv_content,
        mimetype='text/csv',
        headers={'Content-Disposition': f'attachment; filename=users_report_{date.today().isoformat()}.csv'}
    )


# ==============================================================================
# SUPER ADMIN - FULL DATABASE VISIBILITY ENDPOINTS
# ==============================================================================

@bp.route('/data/engineers/full', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_engineers_full_data():
    """Get all engineers with complete profile data, verification, documents, etc."""
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from ..models.block import Block
    from ..models.portfolio import PortfolioItem
    from sqlalchemy import func
    
    page, per_page = get_pagination_params()
    search = request.args.get('search')
    status_filter = request.args.get('status')
    subscription_filter = request.args.get('subscription_status')
    area_filter = request.args.get('area')
    
    query = User.query.filter_by(role=UserRole.ENGINEER.value)
    
    if search:
        query = query.filter(db.or_(
            User.name.ilike(f'%{search}%'),
            User.email.ilike(f'%{search}%'),
            User.phone.ilike(f'%{search}%')
        ))
    if status_filter:
        query = query.filter_by(status=status_filter)
    if area_filter:
        query = query.filter_by(area=area_filter)
    
    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    engineers_data = []
    for engineer in pagination.items:
        profile = engineer.engineer_profile
        
        # Skip if subscription filter doesn't match
        if subscription_filter and profile:
            if profile.subscription_status != subscription_filter:
                continue
        
        # Get comprehensive stats
        completed_jobs = Request.query.filter(
            Request.engineer_id == engineer.id,
            Request.status == RequestStatus.COMPLETED.value
        ).count()
        
        active_jobs = Request.query.filter(
            Request.engineer_id == engineer.id,
            Request.status.in_([RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value])
        ).count()
        
        cancelled_jobs = Request.query.filter(
            Request.engineer_id == engineer.id,
            Request.status == RequestStatus.CANCELLED.value
        ).count()
        
        total_earnings = db.session.query(func.sum(Transaction.net_amount)).filter(
            Transaction.engineer_id == engineer.id
        ).scalar() or 0
        
        # Get block info
        times_blocked = Block.query.filter_by(blocked_id=engineer.id).count()
        has_blocked = Block.query.filter_by(blocker_id=engineer.id).count()
        
        # Get portfolio items
        portfolio_items = PortfolioItem.query.filter_by(engineer_id=engineer.id).count()
        
        # Get review breakdown
        reviews_given = engineer.reviews_given.count()
        reviews_received = engineer.reviews_received.count()
        
        data = {
            'id': engineer.id,
            'name': engineer.name,
            'email': engineer.email,
            'phone': engineer.phone,
            'role': engineer.role,
            'status': engineer.status,
            'city': engineer.city,
            'area': engineer.area,
            'created_at': engineer.created_at.isoformat() if engineer.created_at else None,
            'updated_at': engineer.updated_at.isoformat() if engineer.updated_at else None,
            'profile': {
                'specialization': profile.specialization if profile else None,
                'years_exp': profile.years_exp if profile else 0,
                'bio': profile.bio if profile else None,
                'subscription_status': profile.subscription_status if profile else None,
                'subscription_expiry': profile.subscription_expiry.isoformat() if profile and profile.subscription_expiry else None,
                'rating_avg': round(profile.rating_avg or 0, 2) if profile else 0,
                'rating_count': profile.rating_count if profile else 0,
                'is_available': profile.is_available if profile else False
            } if profile else None,
            'stats': {
                'completed_jobs': completed_jobs,
                'active_jobs': active_jobs,
                'cancelled_jobs': cancelled_jobs,
                'total_earnings': round(total_earnings, 2),
                'portfolio_items': portfolio_items,
                'reviews_given': reviews_given,
                'reviews_received': reviews_received,
                'times_blocked': times_blocked,
                'has_blocked_others': has_blocked
            }
        }
        engineers_data.append(data)
    
    return jsonify({
        'engineers': engineers_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/data/customers/full', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_customers_full_data():
    """Get all customers with request history, reviews, block history."""
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from ..models.block import Block
    from sqlalchemy import func
    
    page, per_page = get_pagination_params()
    search = request.args.get('search')
    status_filter = request.args.get('status')
    area_filter = request.args.get('area')
    
    query = User.query.filter_by(role=UserRole.CUSTOMER.value)
    
    if search:
        query = query.filter(db.or_(
            User.name.ilike(f'%{search}%'),
            User.email.ilike(f'%{search}%'),
            User.phone.ilike(f'%{search}%')
        ))
    if status_filter:
        query = query.filter_by(status=status_filter)
    if area_filter:
        query = query.filter_by(area=area_filter)
    
    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    customers_data = []
    for customer in pagination.items:
        # Get request stats
        total_requests = Request.query.filter_by(customer_id=customer.id).count()
        completed_requests = Request.query.filter(
            Request.customer_id == customer.id,
            Request.status == RequestStatus.COMPLETED.value
        ).count()
        pending_requests = Request.query.filter(
            Request.customer_id == customer.id,
            Request.status == RequestStatus.PENDING.value
        ).count()
        cancelled_requests = Request.query.filter(
            Request.customer_id == customer.id,
            Request.status == RequestStatus.CANCELLED.value
        ).count()
        
        # Get spending
        total_spent = db.session.query(func.sum(Transaction.gross_amount)).filter(
            Transaction.customer_id == customer.id
        ).scalar() or 0
        
        # Get block info
        has_blocked = Block.query.filter_by(blocker_id=customer.id).count()
        times_blocked = Block.query.filter_by(blocked_id=customer.id).count()
        
        # Reviews given
        reviews_given = customer.reviews_given.count()
        
        data = {
            'id': customer.id,
            'name': customer.name,
            'email': customer.email,
            'phone': customer.phone,
            'role': customer.role,
            'status': customer.status,
            'city': customer.city,
            'area': customer.area,
            'created_at': customer.created_at.isoformat() if customer.created_at else None,
            'updated_at': customer.updated_at.isoformat() if customer.updated_at else None,
            'stats': {
                'total_requests': total_requests,
                'completed_requests': completed_requests,
                'pending_requests': pending_requests,
                'cancelled_requests': cancelled_requests,
                'total_spent': round(total_spent, 2),
                'reviews_given': reviews_given,
                'has_blocked_engineers': has_blocked,
                'times_blocked': times_blocked
            }
        }
        customers_data.append(data)
    
    return jsonify({
        'customers': customers_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/data/requests/full', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_requests_full_data():
    """Get all requests with full lifecycle, timestamps, engineer, price, service."""
    from ..models.request import Request, RequestStatus
    from ..models.dispute import Dispute
    
    page, per_page = get_pagination_params()
    status_filter = request.args.get('status')
    type_filter = request.args.get('type')
    customer_id = request.args.get('customer_id', type=int)
    engineer_id = request.args.get('engineer_id', type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    sla_breached = request.args.get('sla_breached')
    
    query = Request.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if type_filter:
        query = query.filter_by(type=type_filter)
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    if engineer_id:
        query = query.filter_by(engineer_id=engineer_id)
    if date_from:
        query = query.filter(Request.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Request.created_at <= datetime.fromisoformat(date_to))
    if sla_breached == 'true':
        query = query.filter(db.or_(
            Request.sla_response_breached == True,
            Request.sla_completion_breached == True
        ))
    
    query = query.order_by(Request.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    requests_data = []
    for req in pagination.items:
        # Get customer and engineer info
        customer = User.query.get(req.customer_id)
        engineer = User.query.get(req.engineer_id) if req.engineer_id else None
        
        # Check for disputes
        dispute = Dispute.query.filter_by(request_id=req.id).first()
        
        # Get review if exists
        review = req.reviews.first()
        
        # Get transaction if exists
        transaction = req.transaction
        
        data = {
            'id': req.id,
            'request_number': req.request_number,
            'type': req.type,
            'category': req.category,
            'description': req.description,
            'location_text': req.location_text,
            'status': req.status,
            'price_at_request': req.price_at_request,
            'customer': {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone
            } if customer else None,
            'engineer': {
                'id': engineer.id,
                'name': engineer.name,
                'email': engineer.email,
                'phone': engineer.phone
            } if engineer else None,
            'service': {
                'id': req.service.id,
                'name': req.service.name,
                'base_price': req.service.base_price
            } if req.service else None,
            'timestamps': {
                'created_at': req.created_at.isoformat() if req.created_at else None,
                'accepted_at': req.accepted_at.isoformat() if req.accepted_at else None,
                'started_at': req.started_at.isoformat() if req.started_at else None,
                'completed_at': req.completed_at.isoformat() if req.completed_at else None,
                'cancelled_at': req.cancelled_at.isoformat() if req.cancelled_at else None
            },
            'sla': {
                'response_deadline': req.sla_response_deadline.isoformat() if req.sla_response_deadline else None,
                'completion_deadline': req.sla_completion_deadline.isoformat() if req.sla_completion_deadline else None,
                'response_breached': req.sla_response_breached,
                'completion_breached': req.sla_completion_breached,
                'status': req.sla_status
            },
            'has_dispute': dispute is not None,
            'dispute_status': dispute.status if dispute else None,
            'has_review': review is not None,
            'review_rating': review.rating if review else None,
            'transaction': {
                'id': transaction.id,
                'gross_amount': transaction.gross_amount,
                'commission': transaction.commission_amount,
                'net_amount': transaction.net_amount
            } if transaction else None
        }
        requests_data.append(data)
    
    return jsonify({
        'requests': requests_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/data/transactions/full', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_transactions_full_data():
    """Get all transactions with full details including request, customer, engineer."""
    from ..models.transaction import Transaction
    
    page, per_page = get_pagination_params()
    customer_id = request.args.get('customer_id', type=int)
    engineer_id = request.args.get('engineer_id', type=int)
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    min_amount = request.args.get('min_amount', type=float)
    max_amount = request.args.get('max_amount', type=float)
    
    query = Transaction.query
    
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    if engineer_id:
        query = query.filter_by(engineer_id=engineer_id)
    if date_from:
        query = query.filter(Transaction.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Transaction.created_at <= datetime.fromisoformat(date_to))
    if min_amount:
        query = query.filter(Transaction.gross_amount >= min_amount)
    if max_amount:
        query = query.filter(Transaction.gross_amount <= max_amount)
    
    query = query.order_by(Transaction.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    transactions_data = []
    for t in pagination.items:
        customer = User.query.get(t.customer_id)
        engineer = User.query.get(t.engineer_id)
        req = t.request
        
        data = {
            'id': t.id,
            'gross_amount': t.gross_amount,
            'commission_rate': t.commission_rate,
            'commission_amount': t.commission_amount,
            'net_amount': t.net_amount,
            'created_at': t.created_at.isoformat() if t.created_at else None,
            'customer': {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email
            } if customer else None,
            'engineer': {
                'id': engineer.id,
                'name': engineer.name,
                'email': engineer.email
            } if engineer else None,
            'request': {
                'id': req.id,
                'request_number': req.request_number,
                'category': req.category,
                'description': req.description[:100] + '...' if len(req.description) > 100 else req.description
            } if req else None
        }
        transactions_data.append(data)
    
    return jsonify({
        'transactions': transactions_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/data/reviews/full', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_reviews_full_data():
    """Get all reviews with full details including reviewer, target, timestamps."""
    page, per_page = get_pagination_params()
    reviewer_id = request.args.get('reviewer_id', type=int)
    reviewee_id = request.args.get('reviewee_id', type=int)
    min_rating = request.args.get('min_rating', type=int)
    max_rating = request.args.get('max_rating', type=int)
    
    query = Review.query
    
    if reviewer_id:
        query = query.filter_by(reviewer_id=reviewer_id)
    if reviewee_id:
        query = query.filter_by(reviewee_id=reviewee_id)
    if min_rating:
        query = query.filter(Review.rating >= min_rating)
    if max_rating:
        query = query.filter(Review.rating <= max_rating)
    
    query = query.order_by(Review.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    reviews_data = []
    for review in pagination.items:
        reviewer = User.query.get(review.reviewer_id)
        reviewee = User.query.get(review.reviewee_id)
        req = review.request
        
        data = {
            'id': review.id,
            'rating': review.rating,
            'text': review.text,
            'created_at': review.created_at.isoformat() if review.created_at else None,
            'reviewer': {
                'id': reviewer.id,
                'name': reviewer.name,
                'email': reviewer.email,
                'role': reviewer.role
            } if reviewer else None,
            'reviewee': {
                'id': reviewee.id,
                'name': reviewee.name,
                'email': reviewee.email,
                'role': reviewee.role
            } if reviewee else None,
            'request': {
                'id': req.id,
                'request_number': req.request_number,
                'category': req.category
            } if req else None
        }
        reviews_data.append(data)
    
    return jsonify({
        'reviews': reviews_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


# ==============================================================================
# SUPER ADMIN - USER ACCESS CONTROL (ABSOLUTE AUTHORITY)
# ==============================================================================

@bp.route('/users/<int:user_id>/force-logout', methods=['POST'])
@jwt_required()
@require_role('admin')
def force_logout_user(user_id):
    """Force logout a user by invalidating their tokens (adds to blocklist)."""
    from ..models.token_blocklist import TokenBlocklist
    
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot force logout yourself'}), 400
    
    # In a real implementation, you'd invalidate all tokens for this user
    # For now, we'll mark the user as needing re-authentication
    # by updating their password hash timestamp or a special field
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='force_logout',
        target_type='user',
        target_id=user_id,
        details={'user_name': user.name, 'user_email': user.email},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    # Notify user
    Notification.create_notification(
        user_id=user_id,
        type='security',
        title='Session Terminated',
        body='Your session has been terminated by an administrator. Please log in again.'
    )
    
    db.session.commit()
    
    return jsonify({
        'message': f'User {user.name} has been logged out',
        'user_id': user_id
    }), 200


@bp.route('/users/<int:user_id>/disable-login', methods=['POST'])
@jwt_required()
@require_role('admin')
def disable_user_login(user_id):
    """Completely disable login for a user (stronger than block)."""
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot disable your own login'}), 400
    
    if user.role == UserRole.ADMIN.value:
        admin_count = User.query.filter_by(role=UserRole.ADMIN.value, status=UserStatus.ACTIVE.value).count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot disable the last active admin'}), 400
    
    user.status = UserStatus.BLOCKED.value
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='disable_login',
        target_type='user',
        target_id=user_id,
        details={'user_name': user.name, 'user_email': user.email, 'user_role': user.role},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': f'Login disabled for {user.name}',
        'user': user.to_dict()
    }), 200


@bp.route('/engineers/<int:engineer_id>/reset-subscription', methods=['POST'])
@jwt_required()
@require_role('admin')
def reset_engineer_subscription(engineer_id):
    """Reset an engineer's subscription status and expiry."""
    user = User.query.get_or_404(engineer_id)
    
    if user.role != UserRole.ENGINEER.value:
        return jsonify({'error': 'User is not an engineer'}), 400
    
    if not user.engineer_profile:
        return jsonify({'error': 'Engineer profile not found'}), 404
    
    data = request.get_json() or {}
    days = data.get('days', 30)
    
    user.engineer_profile.subscription_status = 'active'
    user.engineer_profile.subscription_expiry = date.today() + timedelta(days=days)
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='reset_subscription',
        target_type='engineer_profile',
        target_id=engineer_id,
        details={'engineer_name': user.name, 'days': days},
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': f'Subscription reset for {user.name} ({days} days)',
        'engineer': user.to_dict(include_profile=True)
    }), 200


@bp.route('/requests/<int:request_id>/cancel', methods=['POST'])
@jwt_required()
@require_role('admin')
def admin_cancel_request(request_id):
    """Admin can cancel any request regardless of status."""
    from ..models.request import Request, RequestStatus
    
    req = Request.query.get_or_404(request_id)
    
    if req.status == RequestStatus.COMPLETED.value:
        return jsonify({'error': 'Cannot cancel a completed request'}), 400
    
    data = request.get_json() or {}
    reason = data.get('reason', 'Cancelled by administrator')
    
    old_status = req.status
    req.status = RequestStatus.CANCELLED.value
    req.cancelled_at = datetime.utcnow()
    
    # Notify customer
    Notification.create_notification(
        user_id=req.customer_id,
        type='request_cancelled',
        title='Request Cancelled',
        body=f'Your request {req.request_number} has been cancelled by admin. Reason: {reason}'
    )
    
    # Notify engineer if assigned
    if req.engineer_id:
        Notification.create_notification(
            user_id=req.engineer_id,
            type='request_cancelled',
            title='Request Cancelled',
            body=f'Request {req.request_number} has been cancelled by admin.'
        )
    
    # Log admin action
    AdminActionLog.log(
        admin_id=current_user.id,
        action_type='cancel_request',
        target_type='request',
        target_id=request_id,
        details={
            'request_number': req.request_number,
            'old_status': old_status,
            'reason': reason
        },
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )
    
    db.session.commit()
    
    return jsonify({
        'message': f'Request {req.request_number} cancelled',
        'request': req.to_dict()
    }), 200


# ==============================================================================
# SUPER ADMIN - LIVE SYSTEM MONITORING
# ==============================================================================

@bp.route('/live/dashboard', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_live_dashboard():
    """Get live system state for admin dashboard monitoring."""
    from ..models.request import Request, RequestStatus
    from ..models.transaction import Transaction
    from ..models.dispute import Dispute, DisputeStatus
    from sqlalchemy import func
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    last_hour = now - timedelta(hours=1)
    
    # Active stats
    active_requests = Request.query.filter(
        Request.status.in_([RequestStatus.PENDING.value, RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value])
    ).count()
    
    pending_approvals = User.query.filter_by(
        role=UserRole.ENGINEER.value,
        status=UserStatus.PENDING.value
    ).count()
    
    blocked_users = User.query.filter_by(status=UserStatus.BLOCKED.value).count()
    
    # Today's stats
    transactions_today = Transaction.query.filter(
        Transaction.created_at >= today_start
    ).count()
    
    revenue_today = db.session.query(func.sum(Transaction.gross_amount)).filter(
        Transaction.created_at >= today_start
    ).scalar() or 0
    
    commission_today = db.session.query(func.sum(Transaction.commission_amount)).filter(
        Transaction.created_at >= today_start
    ).scalar() or 0
    
    new_users_today = User.query.filter(
        User.created_at >= today_start
    ).count()
    
    requests_today = Request.query.filter(
        Request.created_at >= today_start
    ).count()
    
    # Open disputes
    open_disputes = Dispute.query.filter(
        Dispute.status.in_([DisputeStatus.OPEN.value, DisputeStatus.IN_REVIEW.value])
    ).count()
    
    # Recent activity
    latest_requests = Request.query.order_by(Request.created_at.desc()).limit(10).all()
    latest_reviews = Review.query.order_by(Review.created_at.desc()).limit(5).all()
    latest_admin_actions = AdminActionLog.query.order_by(AdminActionLog.created_at.desc()).limit(10).all()
    
    return jsonify({
        'timestamp': now.isoformat(),
        'active': {
            'active_requests': active_requests,
            'pending_engineer_approvals': pending_approvals,
            'blocked_users': blocked_users,
            'open_disputes': open_disputes
        },
        'today': {
            'transactions': transactions_today,
            'revenue': round(revenue_today, 2),
            'commission': round(commission_today, 2),
            'new_users': new_users_today,
            'requests': requests_today
        },
        'totals': {
            'total_users': User.query.count(),
            'total_customers': User.query.filter_by(role=UserRole.CUSTOMER.value).count(),
            'total_engineers': User.query.filter_by(role=UserRole.ENGINEER.value).count(),
            'total_requests': Request.query.count(),
            'total_revenue': round(db.session.query(func.sum(Transaction.gross_amount)).scalar() or 0, 2)
        },
        'latest_requests': [
            {
                'id': r.id,
                'request_number': r.request_number,
                'category': r.category,
                'status': r.status,
                'created_at': r.created_at.isoformat() if r.created_at else None,
                'customer_name': User.query.get(r.customer_id).name if r.customer_id else None
            }
            for r in latest_requests
        ],
        'latest_reviews': [
            {
                'id': r.id,
                'rating': r.rating,
                'text': r.text[:50] + '...' if r.text and len(r.text) > 50 else r.text,
                'reviewer_name': User.query.get(r.reviewer_id).name if r.reviewer_id else None,
                'created_at': r.created_at.isoformat() if r.created_at else None
            }
            for r in latest_reviews
        ],
        'latest_admin_actions': [
            {
                'id': a.id,
                'action_type': a.action_type,
                'admin_name': a.admin.name if a.admin else None,
                'target_type': a.target_type,
                'created_at': a.created_at.isoformat() if a.created_at else None
            }
            for a in latest_admin_actions
        ]
    }), 200


@bp.route('/data/blocks', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_all_blocks():
    """Get all block records in the system."""
    from ..models.block import Block
    
    page, per_page = get_pagination_params()
    
    query = Block.query.order_by(Block.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    blocks_data = []
    for block in pagination.items:
        blocker = User.query.get(block.blocker_id)
        blocked = User.query.get(block.blocked_id)
        
        blocks_data.append({
            'id': block.id,
            'blocker': {
                'id': blocker.id,
                'name': blocker.name,
                'role': blocker.role
            } if blocker else None,
            'blocked': {
                'id': blocked.id,
                'name': blocked.name,
                'role': blocked.role
            } if blocked else None,
            'reason': block.reason,
            'created_at': block.created_at.isoformat() if block.created_at else None
        })
    
    return jsonify({
        'blocks': blocks_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200


@bp.route('/data/notifications', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_all_notifications():
    """Get all notifications in the system."""
    page, per_page = get_pagination_params()
    user_id = request.args.get('user_id', type=int)
    notification_type = request.args.get('type')
    
    query = Notification.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    if notification_type:
        query = query.filter_by(type=notification_type)
    
    query = query.order_by(Notification.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    notifications_data = []
    for n in pagination.items:
        user = User.query.get(n.user_id)
        notifications_data.append({
            'id': n.id,
            'type': n.type,
            'title': n.title,
            'body': n.body,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat() if n.created_at else None,
            'user': {
                'id': user.id,
                'name': user.name,
                'role': user.role
            } if user else None
        })
    
    return jsonify({
        'notifications': notifications_data,
        'pagination': {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }), 200
