"""
Services API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify

from ..models.service import Feature, Service

bp = Blueprint('services', __name__)


@bp.route('/features', methods=['GET'])
def get_features():
    """Get all service categories/features."""
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    include_hidden = request.args.get('include_hidden', 'false').lower() == 'true'
    include_non_core = request.args.get('include_non_core', 'false').lower() == 'true'

    query = Feature.query
    if not include_inactive:
        query = query.filter_by(active=True)

    features = query.all()
    
    include_services = request.args.get('include_services', 'false').lower() == 'true'
    
    return jsonify({
        'features': [
            f.to_dict(
                include_services=include_services,
                include_inactive=include_inactive,
                include_hidden=include_hidden,
                include_non_core=include_non_core
            )
            for f in features
        ]
    }), 200


@bp.route('/features/<feature_id>', methods=['GET'])
def get_feature(feature_id):
    """Get a specific feature with its services."""
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    include_hidden = request.args.get('include_hidden', 'false').lower() == 'true'
    include_non_core = request.args.get('include_non_core', 'false').lower() == 'true'

    feature = Feature.query.get(feature_id)
    
    if not feature:
        return jsonify({'error': 'Feature not found'}), 404
    
    return jsonify({
        'feature': feature.to_dict(
            include_services=True,
            include_inactive=include_inactive,
            include_hidden=include_hidden,
            include_non_core=include_non_core
        )
    }), 200


@bp.route('', methods=['GET'])
def get_services():
    """Get services, optionally filtered by feature."""
    feature_id = request.args.get('feature_id')
    domain = request.args.get('domain')
    service_kind = request.args.get('service_kind')
    pricing_mode = request.args.get('pricing_mode')
    active_only = request.args.get('active', 'true').lower() == 'true'
    visible_only = request.args.get('visible', 'true').lower() == 'true'
    core_only = request.args.get('core', 'true').lower() == 'true'
    
    query = Service.query
    
    if feature_id:
        query = query.filter_by(feature_id=feature_id)

    if domain:
        if domain not in Service.ALLOWED_DOMAINS:
            return jsonify({'error': 'Invalid domain value'}), 400
        query = query.filter_by(domain=domain)

    if service_kind:
        if service_kind not in Service.ALLOWED_SERVICE_KINDS:
            return jsonify({'error': 'Invalid service_kind value'}), 400
        query = query.filter_by(service_kind=service_kind)

    if pricing_mode:
        if pricing_mode not in Service.ALLOWED_PRICING_MODES:
            return jsonify({'error': 'Invalid pricing_mode value'}), 400
        query = query.filter_by(pricing_mode=pricing_mode)
    
    if active_only:
        query = query.filter_by(active=True)

    if visible_only:
        query = query.filter_by(is_visible=True)

    if core_only:
        query = query.filter_by(is_core=True)
    
    services = query.all()
    
    return jsonify({
        'services': [s.to_dict(include_feature=True) for s in services]
    }), 200


@bp.route('/<service_id>', methods=['GET'])
def get_service(service_id):
    """Get a specific service by ID."""
    service = Service.query.get(service_id)
    
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    
    return jsonify({
        'service': service.to_dict(include_feature=True)
    }), 200


@bp.route('/price-list', methods=['GET'])
def get_price_list():
    """Get full price list grouped by feature."""
    features = Feature.query.filter_by(active=True).all()
    
    price_list = []
    for feature in features:
        services = Service.query.filter_by(
            feature_id=feature.id,
            active=True,
            is_visible=True,
            is_core=True
        ).all()
        price_list.append({
            'feature': feature.to_dict(),
            'services': [
                {
                    'id': s.id,
                    'name': s.name,
                    'description': s.description,
                    'price': s.base_price,
                    'domain': s.domain,
                    'service_kind': s.service_kind,
                    'pricing_mode': s.pricing_mode,
                    'complexity': s.complexity,
                    'requires_visit': s.requires_visit,
                    'is_core': s.is_core
                }
                for s in services
            ]
        })
    
    return jsonify({
        'price_list': price_list
    }), 200
