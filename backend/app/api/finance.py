"""
Finance API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from sqlalchemy import func

from ..extensions import db
from ..models.transaction import Transaction
from ..models.user import UserRole
from ..utils.decorators import require_role

bp = Blueprint('finance', __name__)


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
