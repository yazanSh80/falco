"""
Blocks API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from ..extensions import db
from ..models.block import Block
from ..models.user import User

bp = Blueprint('blocks', __name__)


@bp.route('', methods=['POST'])
@jwt_required()
def create_block():
    """Block a user."""
    data = request.get_json()
    
    blocked_id = data.get('blocked_id')
    if not blocked_id:
        return jsonify({'error': 'Blocked user ID is required'}), 400
    
    # Check if user exists
    blocked_user = User.query.get(blocked_id)
    if not blocked_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Can't block yourself
    if blocked_id == current_user.id:
        return jsonify({'error': 'You cannot block yourself'}), 400
    
    # Check if already blocked
    existing = Block.query.filter_by(
        blocker_id=current_user.id,
        blocked_id=blocked_id
    ).first()
    
    if existing:
        return jsonify({'error': 'User is already blocked'}), 409
    
    # Create block
    block = Block(
        blocker_id=current_user.id,
        blocked_id=blocked_id,
        reason=data.get('reason')
    )
    
    db.session.add(block)
    db.session.commit()
    
    return jsonify({
        'message': 'User blocked successfully',
        'block': block.to_dict(include_users=True)
    }), 201


@bp.route('', methods=['GET'])
@jwt_required()
def get_blocks():
    """Get blocks created by current user."""
    blocks = Block.query.filter_by(blocker_id=current_user.id).all()
    
    return jsonify({
        'blocks': [b.to_dict(include_users=True) for b in blocks]
    }), 200


@bp.route('/<int:block_id>', methods=['DELETE'])
@jwt_required()
def delete_block(block_id):
    """Remove a block."""
    block = Block.query.get(block_id)
    
    if not block:
        return jsonify({'error': 'Block not found'}), 404
    
    if block.blocker_id != current_user.id:
        return jsonify({'error': 'You can only remove your own blocks'}), 403
    
    db.session.delete(block)
    db.session.commit()
    
    return jsonify({
        'message': 'Block removed successfully'
    }), 200


@bp.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def unblock_user(user_id):
    """Unblock a specific user."""
    block = Block.query.filter_by(
        blocker_id=current_user.id,
        blocked_id=user_id
    ).first()
    
    if not block:
        return jsonify({'error': 'Block not found'}), 404
    
    db.session.delete(block)
    db.session.commit()
    
    return jsonify({
        'message': 'User unblocked successfully'
    }), 200


@bp.route('/check/<int:user_id>', methods=['GET'])
@jwt_required()
def check_block(user_id):
    """Check if there's a block between current user and another user."""
    is_blocked = Block.is_blocked(current_user.id, user_id)
    
    return jsonify({
        'is_blocked': is_blocked
    }), 200
