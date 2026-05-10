"""
Finance API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from sqlalchemy import func

from ..extensions import db
from ..models.payment_record import PaymentRecord, PaymentMethod, PaymentStatus, PaymentPurpose
from ..models.request import Request
from ..models.transaction import Transaction
from ..models.user import UserRole
from ..utils.decorators import require_role

bp = Blueprint('finance', __name__)


def _payment_status_for_submission(method, proof_reference):
    if method in [PaymentMethod.BANK_TRANSFER.value, PaymentMethod.WALLET.value] and proof_reference:
        return PaymentStatus.PROOF_SUBMITTED.value
    return PaymentStatus.PENDING.value


def _create_payment_record_for_request(service_request, data):
    method = data.get('method', PaymentMethod.CASH.value)
    if method not in PaymentRecord.ALLOWED_METHODS:
        return None, ({'error': 'Invalid payment method', 'allowed_methods': sorted(PaymentRecord.ALLOWED_METHODS)}, 400)

    purpose = data.get('purpose') or PaymentRecord.infer_purpose(service_request)
    if purpose not in PaymentRecord.ALLOWED_PURPOSES:
        return None, ({'error': 'Invalid payment purpose', 'allowed_purposes': sorted(PaymentRecord.ALLOWED_PURPOSES)}, 400)

    amount = data.get('amount')
    if amount is None:
        amount = PaymentRecord.infer_amount(service_request, purpose)

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return None, ({'error': 'Invalid payment amount'}, 400)

    if amount < 0:
        return None, ({'error': 'Payment amount cannot be negative'}, 400)

    proof_reference = data.get('proof_reference')
    payment_record = PaymentRecord(
        request_id=service_request.id,
        customer_id=service_request.customer_id,
        engineer_id=service_request.engineer_id,
        method=method,
        status=_payment_status_for_submission(method, proof_reference),
        purpose=purpose,
        amount=round(amount, 2),
        proof_reference=proof_reference,
        notes=data.get('notes')
    )
    db.session.add(payment_record)
    return payment_record, None


@bp.route('/payments', methods=['POST'])
@jwt_required()
@require_role('customer')
def create_payment_record():
    """Create a cash/manual/proof payment record for a customer request."""
    data = request.get_json() or {}
    request_id = data.get('request_id')
    if not request_id:
        return jsonify({'error': 'request_id is required'}), 400

    service_request = Request.query.get(request_id)
    if not service_request:
        return jsonify({'error': 'Request not found'}), 404
    if service_request.customer_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403

    payment_record, error = _create_payment_record_for_request(service_request, data)
    if error:
        body, status_code = error
        return jsonify(body), status_code

    db.session.commit()
    return jsonify({
        'message': 'Payment record created successfully',
        'payment': payment_record.to_dict(include_request=True)
    }), 201


@bp.route('/payments', methods=['GET'])
@jwt_required()
def get_payment_records():
    """Get payment records visible to the current user."""
    if current_user.role == UserRole.CUSTOMER.value:
        query = PaymentRecord.query.filter_by(customer_id=current_user.id)
    elif current_user.role == UserRole.ENGINEER.value:
        query = PaymentRecord.query.filter_by(engineer_id=current_user.id)
    elif current_user.role == UserRole.ADMIN.value:
        query = PaymentRecord.query
    else:
        return jsonify({'error': 'Access denied'}), 403

    status_filter = request.args.get('status')
    if status_filter:
        query = query.filter_by(status=status_filter)

    payments = query.order_by(PaymentRecord.created_at.desc()).all()
    return jsonify({
        'payments': [payment.to_dict(include_request=True) for payment in payments]
    }), 200


@bp.route('/admin/payments/<int:payment_id>', methods=['PATCH'])
@jwt_required()
@require_role('admin')
def update_payment_record(payment_id):
    """Confirm or reject a manual payment record."""
    payment_record = PaymentRecord.query.get(payment_id)
    if not payment_record:
        return jsonify({'error': 'Payment record not found'}), 404

    data = request.get_json() or {}
    next_status = data.get('status')
    if next_status not in [PaymentStatus.CONFIRMED.value, PaymentStatus.REJECTED.value]:
        return jsonify({
            'error': 'Invalid payment status',
            'allowed_statuses': [PaymentStatus.CONFIRMED.value, PaymentStatus.REJECTED.value]
        }), 400

    if next_status == PaymentStatus.CONFIRMED.value:
        payment_record.confirm(current_user.id)
    else:
        payment_record.status = PaymentStatus.REJECTED.value
        payment_record.notes = data.get('notes') or payment_record.notes

    db.session.commit()
    return jsonify({
        'message': 'Payment record updated successfully',
        'payment': payment_record.to_dict(include_request=True)
    }), 200


@bp.route('/customer', methods=['GET'])
@jwt_required()
@require_role('customer')
def get_customer_finance():
    """Get customer's transaction history."""
    transactions = Transaction.query.filter_by(
        customer_id=current_user.id
    ).order_by(Transaction.created_at.desc()).all()
    
    total_spent = sum(t.gross_amount for t in transactions)
    
    return jsonify({
        'transactions': [t.to_dict(include_details=True) for t in transactions],
        'summary': {
            'total_spent': round(total_spent, 2),
            'transaction_count': len(transactions)
        }
    }), 200


@bp.route('/engineer', methods=['GET'])
@jwt_required()
@require_role('engineer')
def get_engineer_finance():
    """Get engineer's earnings history."""
    transactions = Transaction.query.filter_by(
        engineer_id=current_user.id
    ).order_by(Transaction.created_at.desc()).all()
    
    total_gross = sum(t.gross_amount for t in transactions)
    total_commission = sum(t.commission_amount for t in transactions)
    total_net = sum(t.net_amount for t in transactions)
    
    return jsonify({
        'transactions': [t.to_dict(include_details=True) for t in transactions],
        'summary': {
            'total_gross': round(total_gross, 2),
            'total_commission': round(total_commission, 2),
            'total_net': round(total_net, 2),
            'transaction_count': len(transactions)
        }
    }), 200


@bp.route('/admin/summary', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_admin_finance_summary():
    """Get platform-wide financial summary (admin only)."""
    # Get overall stats
    stats = db.session.query(
        func.count(Transaction.id).label('count'),
        func.sum(Transaction.gross_amount).label('total_gross'),
        func.sum(Transaction.commission_amount).label('total_commission'),
        func.sum(Transaction.net_amount).label('total_net')
    ).first()
    
    # Recent transactions
    recent = Transaction.query.order_by(
        Transaction.created_at.desc()
    ).limit(20).all()
    
    # Top earning engineers
    top_engineers = db.session.query(
        Transaction.engineer_id,
        func.sum(Transaction.net_amount).label('total_earnings'),
        func.count(Transaction.id).label('job_count')
    ).group_by(Transaction.engineer_id).order_by(
        func.sum(Transaction.net_amount).desc()
    ).limit(10).all()
    
    from ..models.user import User
    top_engineers_data = []
    for engineer_id, total_earnings, job_count in top_engineers:
        engineer = User.query.get(engineer_id)
        if engineer:
            top_engineers_data.append({
                'engineer_id': engineer_id,
                'name': engineer.name,
                'total_earnings': round(total_earnings or 0, 2),
                'job_count': job_count
            })
    
    return jsonify({
        'summary': {
            'total_transactions': stats.count or 0,
            'total_gross': round(stats.total_gross or 0, 2),
            'total_commission': round(stats.total_commission or 0, 2),
            'total_paid_to_engineers': round(stats.total_net or 0, 2)
        },
        'recent_transactions': [t.to_dict(include_details=True) for t in recent],
        'top_engineers': top_engineers_data
    }), 200


@bp.route('/admin/transactions', methods=['GET'])
@jwt_required()
@require_role('admin')
def get_all_transactions():
    """Get all transactions (admin only)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = Transaction.query.order_by(
        Transaction.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'transactions': [t.to_dict(include_details=True) for t in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages
        }
    }), 200
