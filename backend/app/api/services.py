"""
Services API for FalcoElectrec
"""
from flask import Blueprint, request, jsonify

from ..models.service import Feature, Service

bp = Blueprint('services', __name__)


@bp.route('/features', methods=['GET'])
def get_features():
    """Get all service categories/features."""
    features = Feature.query.filter_by(active=True).all()
    
    include_services = request.args.get('include_services', 'false').lower() == 'true'
    
    return jsonify({
        'features': [f.to_dict(include_services=include_services) for f in features]
    }), 200


@bp.route('/features/<feature_id>', methods=['GET'])
def get_feature(feature_id):
    """Get a specific feature with its services."""
    feature = Feature.query.get(feature_id)
    
    if not feature:
        return jsonify({'error': 'Feature not found'}), 404
    
    return jsonify({
        'feature': feature.to_dict(include_services=True)
    }), 200


@bp.route('', methods=['GET'])
def get_services():
    """Get services, optionally filtered by feature."""
    feature_id = request.args.get('feature_id')
    active_only = request.args.get('active', 'true').lower() == 'true'
    
    query = Service.query
    
    if feature_id:
        query = query.filter_by(feature_id=feature_id)
    
    if active_only:
        query = query.filter_by(active=True)
    
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
        services = Service.query.filter_by(feature_id=feature.id, active=True).all()
        price_list.append({
            'feature': feature.to_dict(),
            'services': [
                {
                    'id': s.id,
                    'name': s.name,
                    'description': s.description,
                    'price': s.base_price
                }
                for s in services
            ]
        })
    
    return jsonify({
        'price_list': price_list
    }), 200
