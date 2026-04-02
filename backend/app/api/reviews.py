"""
Reviews API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from ..extensions import db
from ..models.review import Review
from ..models.request import Request, RequestStatus
from ..models.notification import Notification
from ..models.user import UserRole
from ..utils.validation import validation_error_response, validate_rating

bp = Blueprint('reviews', __name__)


@bp.route('', methods=['POST'])
@jwt_required()
def create_review():
    """Create a review for a completed request."""
    data = request.get_json()
    
    if not data:
        return validation_error_response(
            'Request body must be valid JSON',
            code='INVALID_JSON'
        )
    
    # Validate required fields
    request_id = data.get('request_id')
    rating = data.get('rating')
    
    if not request_id:
        return validation_error_response(
            'Request ID is required',
            code='MISSING_FIELD',
            fields={'request_id': 'This field is required'}
        )
    
    # Validate rating using utility function
    is_valid, error_msg = validate_rating(rating)
    if not is_valid:
        return validation_error_response(
            error_msg,
            code='INVALID_RATING',
            fields={'rating': error_msg}
        )
    
    # Get the request
    req = Request.query.get(request_id)
    if not req:
        return jsonify({'error': 'Request not found'}), 404
    
    # Check if request is completed
    if req.status != RequestStatus.COMPLETED.value:
        return jsonify({'error': 'Can only review completed requests'}), 400
    
    # Determine reviewer and reviewee
    user = current_user
    if user.id == req.customer_id:
        reviewee_id = req.engineer_id
    elif user.id == req.engineer_id:
        reviewee_id = req.customer_id
    else:
        return jsonify({'error': 'You are not part of this request'}), 403
    
    # Check if already reviewed
    existing = Review.query.filter_by(
        request_id=request_id,
        reviewer_id=user.id
    ).first()
    
    if existing:
        return jsonify({'error': 'You have already reviewed this request'}), 409
    
    # Create review
    review = Review(
        request_id=request_id,
        reviewer_id=user.id,
        reviewee_id=reviewee_id,
        rating=rating,
        text=data.get('text', '')
    )
    
    db.session.add(review)
    
    # Update engineer's average rating if reviewee is an engineer
    from ..models.user import User
    reviewee = User.query.get(reviewee_id)
    if reviewee and reviewee.is_engineer() and reviewee.engineer_profile:
        reviewee.engineer_profile.update_rating(rating)
    
    # Notify reviewee
    Notification.notify_review_received(reviewee_id, user.name, rating)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Review submitted successfully',
        'review': review.to_dict(include_users=True)
    }), 201


@bp.route('', methods=['GET'])
@jwt_required()
def get_reviews():
    """Get reviews for a user or by a user."""
    user_id = request.args.get('user_id', type=int)
    review_type = request.args.get('type')  # 'received' or 'given'
    min_rating = request.args.get('min_rating', type=int)
    
    # Default to current user if no user_id specified
    if not user_id:
        user_id = current_user.id
    
    # Build query
    if review_type == 'given':
        query = Review.query.filter_by(reviewer_id=user_id)
    else:  # Default to 'received'
        query = Review.query.filter_by(reviewee_id=user_id)
    
    # Filter by rating
    if min_rating:
        query = query.filter(Review.rating >= min_rating)
    
    # Order by date
    query = query.order_by(Review.created_at.desc())
    
    reviews = query.all()
    
    return jsonify({
        'reviews': [r.to_dict(include_users=True) for r in reviews]
    }), 200


@bp.route('/<int:review_id>', methods=['GET'])
@jwt_required()
def get_review(review_id):
    """Get a specific review."""
    review = Review.query.get(review_id)
    
    if not review:
        return jsonify({'error': 'Review not found'}), 404
    
    return jsonify({
        'review': review.to_dict(include_users=True)
    }), 200
