"""
Recommendation v1 API for FalcoElectrec.

Scores engineers only by area, domain, rating, and availability.
"""
from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import current_user, jwt_required
from sqlalchemy import or_

from ..models.block import Block
from ..models.engineer_profile import EngineerProfile, SubscriptionStatus
from ..models.request import Request, RequestStatus
from ..models.user import User, UserRole, UserStatus

bp = Blueprint('recommendations', __name__)

ACTIVE_JOB_STATUSES = [
    RequestStatus.ROUTED.value,
    RequestStatus.ACCEPTED.value,
    RequestStatus.IN_PROGRESS.value
]


def _parse_limit(raw_limit, default=5, maximum=10):
    try:
        return min(max(int(raw_limit), 1), maximum)
    except (TypeError, ValueError):
        return default


def _normalize(value):
    return (value or '').strip().lower()


def _active_job_count(engineer_id):
    return Request.query.filter(
        Request.engineer_id == engineer_id,
        Request.status.in_(ACTIVE_JOB_STATUSES)
    ).count()


def _score_engineer(profile, engineer_area, target_area, target_domain, is_available):
    area_match = bool(target_area and _normalize(engineer_area) == _normalize(target_area))
    domain_match = bool(target_domain and profile.domain == target_domain)
    rating_normalized = min(max((profile.rating_avg or 0) / 5.0, 0), 1)
    availability_normalized = 1.0 if is_available else 0.0

    area_normalized = 1.0 if area_match else 0.0
    domain_normalized = 1.0 if not target_domain or domain_match else 0.0

    score = (
        0.30 * area_normalized
        + 0.30 * domain_normalized
        + 0.25 * rating_normalized
        + 0.15 * availability_normalized
    )

    return {
        'total_score': round(score, 3),
        'breakdown': {
            'area': {
                'value': engineer_area,
                'match': area_match,
                'weighted': round(0.30 * area_normalized, 3),
                'weight': '30%'
            },
            'domain': {
                'value': profile.domain,
                'match': domain_match if target_domain else None,
                'weighted': round(0.30 * domain_normalized, 3),
                'weight': '30%'
            },
            'rating': {
                'value': profile.rating_avg or 0,
                'normalized': round(rating_normalized, 3),
                'weighted': round(0.25 * rating_normalized, 3),
                'weight': '25%'
            },
            'availability': {
                'value': is_available,
                'normalized': availability_normalized,
                'weighted': round(0.15 * availability_normalized, 3),
                'weight': '15%'
            }
        }
    }


@bp.route('/engineers', methods=['GET'])
@jwt_required()
def get_recommended_engineers():
    """
    Return Recommendation v1 engineers ranked by area, domain, rating, availability.
    """
    area = request.args.get('area') or current_user.area
    domain = request.args.get('domain')
    limit = _parse_limit(request.args.get('limit'))

    if domain and domain not in EngineerProfile.ALLOWED_DOMAINS:
        return jsonify({
            'error': 'Invalid domain',
            'allowed_domains': sorted(EngineerProfile.ALLOWED_DOMAINS)
        }), 400

    blocked_ids = Block.get_blocked_ids(current_user.id)

    query = User.query.join(EngineerProfile).filter(
        User.role == UserRole.ENGINEER.value,
        User.status == UserStatus.ACTIVE.value,
        EngineerProfile.subscription_status == SubscriptionStatus.ACTIVE.value,
        or_(
            EngineerProfile.subscription_expiry.is_(None),
            EngineerProfile.subscription_expiry >= date.today()
        )
    )

    if domain:
        query = query.filter(EngineerProfile.domain == domain)

    if blocked_ids:
        query = query.filter(~User.id.in_(blocked_ids))

    candidates = query.all()
    engineers = []

    for engineer in candidates:
        profile = engineer.engineer_profile
        active_jobs = _active_job_count(engineer.id)
        is_available = active_jobs < 3
        score_data = _score_engineer(profile, engineer.area, area, domain, is_available)

        engineers.append({
            'id': engineer.id,
            'name': engineer.name,
            'email': engineer.email,
            'phone': engineer.phone,
            'city': engineer.city,
            'area': engineer.area,
            'specialization': profile.specialization,
            'domain': profile.domain,
            'rating_avg': profile.rating_avg or 0,
            'rating_count': profile.rating_count or 0,
            'is_available': is_available,
            'active_jobs': active_jobs,
            'score': score_data['total_score'],
            'score_breakdown': score_data['breakdown']
        })

    engineers.sort(
        key=lambda item: (
            item['score'],
            item['rating_avg'],
            item['is_available'],
            -item['active_jobs']
        ),
        reverse=True
    )

    top_engineers = engineers[:limit]

    return jsonify({
        'recommendation_version': 'v1',
        'engineers': top_engineers,
        'total_available': len(engineers),
        'showing': len(top_engineers),
        'filters': {
            'area': area or None,
            'domain': domain or None
        }
    }), 200


@bp.route('/suggestions', methods=['POST'])
@jwt_required()
def get_smart_suggestions():
    return jsonify({
        'error': 'not_available',
        'message': 'Description matching is outside Recommendation v1 scope.'
    }), 410
