"""
Engineer Recommendations API for FalcoElectrec
Smart recommendations based on rating, experience, and availability.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from sqlalchemy import func

from ..extensions import db
from ..models.user import User, UserRole, UserStatus
from ..models.engineer_profile import EngineerProfile, SubscriptionStatus
from ..models.request import Request, RequestStatus
from ..models.block import Block

bp = Blueprint('recommendations', __name__)


def calculate_engineer_score(engineer_data: dict, max_jobs: int) -> dict:
    """
    Calculate recommendation score for an engineer.
    
    Formula: score = 0.45*(rating_avg/5) + 0.35*(jobs_completed normalized) + 0.20*(availability flag)
    
    Returns score and breakdown explanation.
    """
    rating_avg = engineer_data.get('rating_avg', 0) or 0
    jobs_completed = engineer_data.get('jobs_completed', 0) or 0
    is_available = engineer_data.get('is_available', True)
    
    # Normalize values
    rating_normalized = rating_avg / 5.0  # 0-1 scale
    jobs_normalized = jobs_completed / max(max_jobs, 1)  # 0-1 scale (relative to top performer)
    availability_score = 1.0 if is_available else 0.0
    
    # Calculate weighted score
    rating_component = 0.45 * rating_normalized
    jobs_component = 0.35 * jobs_normalized
    availability_component = 0.20 * availability_score
    
    total_score = rating_component + jobs_component + availability_component
    
    return {
        'total_score': round(total_score, 3),
        'breakdown': {
            'rating': {
                'value': rating_avg,
                'normalized': round(rating_normalized, 3),
                'weighted': round(rating_component, 3),
                'weight': '45%'
            },
            'jobs_completed': {
                'value': jobs_completed,
                'normalized': round(jobs_normalized, 3),
                'weighted': round(jobs_component, 3),
                'weight': '35%'
            },
            'availability': {
                'value': is_available,
                'normalized': availability_score,
                'weighted': round(availability_component, 3),
                'weight': '20%'
            }
        }
    }


def get_badges(engineer_data: dict, max_rating: float, max_jobs: int, customer_area: str) -> list:
    """Generate badge list for an engineer based on their stats."""
    badges = []
    
    rating_avg = engineer_data.get('rating_avg', 0) or 0
    jobs_completed = engineer_data.get('jobs_completed', 0) or 0
    engineer_area = engineer_data.get('area', '')
    
    # Top Rated badge - rating >= 4.5 or is the highest rated
    if rating_avg >= 4.5 or (rating_avg > 0 and rating_avg >= max_rating):
        badges.append({
            'type': 'top_rated',
            'label': 'Top Rated',
            'icon': 'star',
            'color': 'yellow'
        })
    
    # Most Worked badge - has the most completed jobs or top 20%
    if max_jobs > 0 and jobs_completed >= max_jobs * 0.8:
        badges.append({
            'type': 'most_worked',
            'label': 'Most Worked',
            'icon': 'briefcase',
            'color': 'blue'
        })
    
    # Nearest badge - same area as customer
    if customer_area and engineer_area and engineer_area.lower() == customer_area.lower():
        badges.append({
            'type': 'nearest',
            'label': 'Nearest',
            'icon': 'map-pin',
            'color': 'green'
        })
    
    # New badge - less than 5 completed jobs but good rating
    if jobs_completed < 5 and rating_avg >= 4.0:
        badges.append({
            'type': 'rising_star',
            'label': 'Rising Star',
            'icon': 'trending-up',
            'color': 'purple'
        })
    
    return badges


@bp.route('/engineers', methods=['GET'])
@jwt_required()
def get_recommended_engineers():
    """
    Get recommended engineers for a service request.
    
    Query params:
    - service_id: Optional service ID to filter by specialization
    - area: Optional area to prioritize engineers from same area
    - limit: Number of recommendations (default 5, max 10)
    
    Returns top engineers sorted by recommendation score.
    """
    service_id = request.args.get('service_id')
    area = request.args.get('area', '')
    limit = min(int(request.args.get('limit', 5)), 10)
    
    # Get customer's blocked users
    blocked_ids = Block.get_blocked_ids(current_user.id)
    
    # Base query: engineers with active status and active subscription
    query = db.session.query(
        User,
        EngineerProfile,
        func.count(Request.id).filter(Request.status == RequestStatus.COMPLETED.value).label('jobs_completed')
    ).join(
        EngineerProfile, User.id == EngineerProfile.user_id
    ).outerjoin(
        Request, User.id == Request.engineer_id
    ).filter(
        User.role == UserRole.ENGINEER.value,
        User.status == UserStatus.ACTIVE.value,
        EngineerProfile.subscription_status == SubscriptionStatus.ACTIVE.value
    ).group_by(
        User.id, EngineerProfile.user_id
    )
    
    # Filter out blocked engineers
    if blocked_ids:
        query = query.filter(~User.id.in_(blocked_ids))
    
    # Filter by area if provided (simple string match)
    if area:
        query = query.filter(
            func.lower(User.area) == func.lower(area)
        )
    
    # Execute query
    results = query.all()
    
    if not results:
        # If no results with area filter, try without area filter
        if area:
            query = db.session.query(
                User,
                EngineerProfile,
                func.count(Request.id).filter(Request.status == RequestStatus.COMPLETED.value).label('jobs_completed')
            ).join(
                EngineerProfile, User.id == EngineerProfile.user_id
            ).outerjoin(
                Request, User.id == Request.engineer_id
            ).filter(
                User.role == UserRole.ENGINEER.value,
                User.status == UserStatus.ACTIVE.value,
                EngineerProfile.subscription_status == SubscriptionStatus.ACTIVE.value
            ).group_by(
                User.id, EngineerProfile.user_id
            )
            
            if blocked_ids:
                query = query.filter(~User.id.in_(blocked_ids))
            
            results = query.all()
    
    if not results:
        return jsonify({
            'engineers': [],
            'message': 'No engineers available at this time'
        }), 200
    
    # Compute max values for normalization
    max_jobs = max(r.jobs_completed or 0 for r in results) if results else 1
    max_rating = max(r.EngineerProfile.rating_avg or 0 for r in results) if results else 5.0
    
    # Build engineer data with scores
    engineers_with_scores = []
    
    for user, profile, jobs_completed in results:
        # Check availability (not currently assigned to in-progress jobs)
        active_jobs = Request.query.filter(
            Request.engineer_id == user.id,
            Request.status.in_([RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value])
        ).count()
        is_available = active_jobs < 3  # Available if less than 3 active jobs
        
        engineer_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'city': user.city,
            'area': user.area,
            'specialization': profile.specialization,
            'years_exp': profile.years_exp,
            'bio': profile.bio,
            'rating_avg': profile.rating_avg,
            'rating_count': profile.rating_count,
            'jobs_completed': jobs_completed or 0,
            'is_available': is_available,
            'active_jobs': active_jobs
        }
        
        # Calculate score
        score_data = calculate_engineer_score(engineer_data, max_jobs)
        engineer_data['score'] = score_data['total_score']
        engineer_data['score_breakdown'] = score_data['breakdown']
        
        # Add badges
        engineer_data['badges'] = get_badges(
            engineer_data, 
            max_rating, 
            max_jobs, 
            current_user.area or area
        )
        
        engineers_with_scores.append(engineer_data)
    
    # Sort by score descending
    engineers_with_scores.sort(key=lambda x: x['score'], reverse=True)
    
    # Return top N
    top_engineers = engineers_with_scores[:limit]
    
    return jsonify({
        'engineers': top_engineers,
        'total_available': len(engineers_with_scores),
        'showing': len(top_engineers),
        'filters': {
            'area': area or None,
            'service_id': service_id or None
        }
    }), 200


# ==================== Smart Suggestions ====================

# Keywords mapping to service categories
SERVICE_KEYWORDS = {
    'electrical': {
        'keywords': ['electrical', 'wire', 'wiring', 'socket', 'outlet', 'switch', 'breaker', 
                     'circuit', 'power', 'electricity', 'volt', 'amp', 'light', 'lighting',
                     'fuse', 'panel', 'كهرباء', 'سلك', 'مفتاح', 'توصيلات'],
        'service_id': 'EL001',
        'urgency_keywords': ['spark', 'fire', 'smoke', 'no power', 'blackout', 'emergency']
    },
    'plumbing': {
        'keywords': ['plumb', 'pipe', 'leak', 'water', 'drain', 'faucet', 'toilet', 'sink',
                     'shower', 'bath', 'sewer', 'clog', 'blocked', 'flooding', 'tap',
                     'سباكة', 'ماء', 'تسريب', 'أنبوب', 'صرف'],
        'service_id': 'PL001',
        'urgency_keywords': ['flooding', 'burst', 'major leak', 'sewage', 'no water']
    },
    'hvac': {
        'keywords': ['air condition', 'ac', 'a/c', 'heating', 'cooling', 'hvac', 'ventilation',
                     'furnace', 'thermostat', 'duct', 'vent', 'compressor', 'refrigerant',
                     'تكييف', 'تبريد', 'تدفئة', 'مكيف'],
        'service_id': 'HV001',
        'urgency_keywords': ['no cooling', 'no heating', 'freezing', 'overheating']
    },
    'appliance': {
        'keywords': ['appliance', 'refrigerator', 'fridge', 'washer', 'dryer', 'dishwasher',
                     'oven', 'stove', 'microwave', 'machine', 'غسالة', 'ثلاجة', 'فرن'],
        'service_id': 'AP001',
        'urgency_keywords': ['not working', 'broken', 'smoking']
    },
    'general': {
        'keywords': ['maintenance', 'repair', 'fix', 'install', 'installation', 'service',
                     'صيانة', 'إصلاح', 'تركيب'],
        'service_id': 'GN001',
        'urgency_keywords': []
    }
}


def analyze_description(description: str) -> dict:
    """
    Analyze request description and suggest service type and urgency.
    Uses rule-based keyword matching.
    """
    description_lower = description.lower()
    words = description_lower.split()
    
    matches = {}
    urgency_score = 0
    urgency_reasons = []
    
    for category, config in SERVICE_KEYWORDS.items():
        score = 0
        matched_keywords = []
        
        for keyword in config['keywords']:
            if keyword.lower() in description_lower:
                score += 1
                matched_keywords.append(keyword)
        
        if score > 0:
            matches[category] = {
                'score': score,
                'matched_keywords': matched_keywords,
                'service_id': config['service_id']
            }
        
        # Check urgency keywords
        for urgent_word in config.get('urgency_keywords', []):
            if urgent_word.lower() in description_lower:
                urgency_score += 2
                urgency_reasons.append(urgent_word)
    
    # Check for general urgency indicators
    urgent_indicators = ['urgent', 'emergency', 'asap', 'immediately', 'right now', 
                        'quickly', 'fast', 'طارئ', 'فوري', 'سريع']
    for indicator in urgent_indicators:
        if indicator in description_lower:
            urgency_score += 3
            urgency_reasons.append(indicator)
    
    # Sort matches by score
    sorted_matches = sorted(matches.items(), key=lambda x: x[1]['score'], reverse=True)
    
    # Determine suggested service
    suggested_service = None
    confidence = 'low'
    
    if sorted_matches:
        top_match = sorted_matches[0]
        suggested_service = {
            'category': top_match[0],
            'service_id': top_match[1]['service_id'],
            'matched_keywords': top_match[1]['matched_keywords'],
            'score': top_match[1]['score']
        }
        
        if top_match[1]['score'] >= 3:
            confidence = 'high'
        elif top_match[1]['score'] >= 2:
            confidence = 'medium'
    
    # Determine urgency level
    if urgency_score >= 5:
        urgency = 'high'
    elif urgency_score >= 2:
        urgency = 'medium'
    else:
        urgency = 'low'
    
    return {
        'suggested_service': suggested_service,
        'confidence': confidence,
        'all_matches': [
            {'category': cat, **data} 
            for cat, data in sorted_matches
        ],
        'urgency': {
            'level': urgency,
            'score': urgency_score,
            'reasons': urgency_reasons
        },
        'recommended_type': 'quick' if urgency in ['high', 'medium'] else 'late'
    }


@bp.route('/suggestions', methods=['POST'])
@jwt_required()
def get_smart_suggestions():
    """
    Analyze request description and provide smart suggestions.
    
    Request body:
    {
        "description": "My electrical outlet is sparking and smoking"
    }
    
    Returns:
    - suggested_service: Most likely service category
    - confidence: low/medium/high
    - all_matches: All matched categories with scores
    - urgency: low/medium/high with reasons
    - recommended_type: quick or late based on urgency
    """
    data = request.get_json()
    
    if not data or not data.get('description'):
        return jsonify({'error': 'Description is required'}), 400
    
    description = data['description'].strip()
    
    if len(description) < 10:
        return jsonify({'error': 'Description too short. Please provide more details.'}), 400
    
    suggestions = analyze_description(description)
    
    return jsonify(suggestions), 200
