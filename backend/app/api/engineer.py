"""
Engineer Profile API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from ..extensions import db
from ..models.engineer_profile import EngineerProfile
from ..models.portfolio import PortfolioItem
from ..models.user import User, UserRole
from ..utils.decorators import require_role

bp = Blueprint('engineer', __name__)


@bp.route('/profile', methods=['GET'])
@jwt_required()
@require_role('engineer')
def get_profile():
    """Get current engineer's profile."""
    profile = current_user.engineer_profile
    
    if not profile:
        return jsonify({'error': 'Engineer profile not found'}), 404
    
    # Get portfolio items
    portfolio = PortfolioItem.query.filter_by(engineer_id=current_user.id).all()
    
    return jsonify({
        'user': current_user.to_dict(),
        'profile': profile.to_dict(),
        'portfolio': [p.to_dict() for p in portfolio]
    }), 200


@bp.route('/profile', methods=['PUT'])
@jwt_required()
@require_role('engineer')
def update_profile():
    """Update engineer profile."""
    data = request.get_json()
    profile = current_user.engineer_profile
    
    if not profile:
        return jsonify({'error': 'Engineer profile not found'}), 404
    
    # Update allowed fields
    if 'specialization' in data:
        profile.specialization = data['specialization']
    if 'years_exp' in data:
        profile.years_exp = data['years_exp']
    if 'bio' in data:
        profile.bio = data['bio']
    
    # Update user fields too
    if 'name' in data:
        current_user.name = data['name']
    if 'phone' in data:
        current_user.phone = data['phone']
    if 'city' in data:
        current_user.city = data['city']
    if 'area' in data:
        current_user.area = data['area']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict(),
        'user': current_user.to_dict()
    }), 200


@bp.route('/portfolio', methods=['GET'])
@jwt_required()
@require_role('engineer')
def get_portfolio():
    """Get engineer's portfolio items."""
    items = PortfolioItem.query.filter_by(engineer_id=current_user.id).all()
    
    return jsonify({
        'portfolio': [p.to_dict() for p in items]
    }), 200


@bp.route('/portfolio', methods=['POST'])
@jwt_required()
@require_role('engineer')
def add_portfolio_item():
    """Add a portfolio item."""
    data = request.get_json()
    
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    item = PortfolioItem(
        engineer_id=current_user.id,
        title=data['title'],
        description=data.get('description'),
        location=data.get('location'),
        image_url=data.get('image_url')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify({
        'message': 'Portfolio item added',
        'item': item.to_dict()
    }), 201


@bp.route('/portfolio/<int:item_id>', methods=['PUT'])
@jwt_required()
@require_role('engineer')
def update_portfolio_item(item_id):
    """Update a portfolio item."""
    item = PortfolioItem.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Portfolio item not found'}), 404
    
    if item.engineer_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    if 'title' in data:
        item.title = data['title']
    if 'description' in data:
        item.description = data['description']
    if 'location' in data:
        item.location = data['location']
    if 'image_url' in data:
        item.image_url = data['image_url']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Portfolio item updated',
        'item': item.to_dict()
    }), 200


@bp.route('/portfolio/<int:item_id>', methods=['DELETE'])
@jwt_required()
@require_role('engineer')
def delete_portfolio_item(item_id):
    """Delete a portfolio item."""
    item = PortfolioItem.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Portfolio item not found'}), 404
    
    if item.engineer_id != current_user.id:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({
        'message': 'Portfolio item deleted'
    }), 200


@bp.route('/subscription', methods=['GET'])
@jwt_required()
@require_role('engineer')
def get_subscription():
    """Get subscription status."""
    profile = current_user.engineer_profile
    
    if not profile:
        return jsonify({'error': 'Engineer profile not found'}), 404
    
    return jsonify({
        'subscription': {
            'status': profile.subscription_status,
            'expiry': profile.subscription_expiry.isoformat() if profile.subscription_expiry else None,
            'is_active': profile.is_subscription_active()
        }
    }), 200


@bp.route('/public/<int:engineer_id>', methods=['GET'])
def get_public_profile(engineer_id):
    """Get public engineer profile."""
    user = User.query.get(engineer_id)
    
    if not user or user.role != UserRole.ENGINEER.value:
        return jsonify({'error': 'Engineer not found'}), 404
    
    profile = user.engineer_profile
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    
    # Get portfolio
    portfolio = PortfolioItem.query.filter_by(engineer_id=engineer_id).all()
    
    # Get reviews
    from ..models.review import Review
    reviews = Review.query.filter_by(reviewee_id=engineer_id).order_by(
        Review.created_at.desc()
    ).limit(10).all()
    
    return jsonify({
        'engineer': {
            'id': user.id,
            'name': user.name,
            'city': user.city,
            'area': user.area,
            'specialization': profile.specialization,
            'years_exp': profile.years_exp,
            'bio': profile.bio,
            'rating_avg': profile.rating_avg,
            'rating_count': profile.rating_count
        },
        'portfolio': [p.to_dict() for p in portfolio],
        'reviews': [r.to_dict(include_users=True) for r in reviews]
    }), 200
