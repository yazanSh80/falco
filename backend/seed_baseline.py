"""
Baseline catalog seed for FalcoElectrec.

Run with: python seed_baseline.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.service import Feature, Service


BASE_FEATURES = [
    {
        'id': 'F1',
        'name': 'Electrical',
        'icon': 'Zap',
        'description': 'Electrical services and repairs'
    },
    {
        'id': 'F2',
        'name': 'A/C',
        'icon': 'Wind',
        'description': 'Air conditioning maintenance and repair'
    },
    {
        'id': 'F3',
        'name': 'Low Current',
        'icon': 'Shield',
        'description': 'Low current systems and cabling'
    },
    {
        'id': 'F4',
        'name': 'Solar',
        'icon': 'Sun',
        'description': 'Solar system services'
    },
    {
        'id': 'F5',
        'name': 'Fiber',
        'icon': 'Router',
        'description': 'Fiber installations and termination'
    },
    {
        'id': 'F6',
        'name': 'Smart Systems',
        'icon': 'Cpu',
        'description': 'Smart systems and automation'
    },
    {
        'id': 'F7',
        'name': 'Special Works',
        'icon': 'Tool',
        'description': 'Special project-based works'
    }
]

BASE_SERVICES = [
    {
        'id': 'EL001',
        'feature_id': 'F1',
        'name': 'Electrical Repair Visit',
        'description': 'Standard electrical repair service',
        'base_price': 150,
        'domain': 'electrical',
        'service_kind': 'standard_service',
        'pricing_mode': 'fixed',
        'complexity': 'basic',
        'requires_visit': True,
        'active': True,
        'is_visible': True,
        'is_core': True
    },
    {
        'id': 'AC001',
        'feature_id': 'F2',
        'name': 'A/C Maintenance Visit',
        'description': 'Standard A/C maintenance service',
        'base_price': 200,
        'domain': 'ac',
        'service_kind': 'standard_service',
        'pricing_mode': 'fixed',
        'complexity': 'basic',
        'requires_visit': True,
        'active': True,
        'is_visible': True,
        'is_core': True
    },
    {
        'id': 'LC001',
        'feature_id': 'F3',
        'name': 'CCTV Wiring Check',
        'description': 'Low current inspection and wiring check',
        'base_price': 220,
        'domain': 'low_current',
        'service_kind': 'standard_service',
        'pricing_mode': 'after_visit',
        'complexity': 'standard',
        'requires_visit': True,
        'active': True,
        'is_visible': True,
        'is_core': True
    },
    {
        'id': 'SO001',
        'feature_id': 'F4',
        'name': 'Solar System Inspection',
        'description': 'Initial solar system inspection',
        'base_price': 250,
        'domain': 'solar',
        'service_kind': 'inspection',
        'pricing_mode': 'inspection_fee',
        'complexity': 'advanced',
        'requires_visit': True,
        'active': True,
        'is_visible': True,
        'is_core': False
    },
    {
        'id': 'FB001',
        'feature_id': 'F5',
        'name': 'Fiber Termination',
        'description': 'Fiber termination and testing',
        'base_price': 180,
        'domain': 'fiber',
        'service_kind': 'standard_service',
        'pricing_mode': 'fixed',
        'complexity': 'standard',
        'requires_visit': True,
        'active': True,
        'is_visible': True,
        'is_core': False
    },
    {
        'id': 'SM001',
        'feature_id': 'F6',
        'name': 'Smart Switch Setup',
        'description': 'Smart switch installation and configuration',
        'base_price': 140,
        'domain': 'smart',
        'service_kind': 'standard_service',
        'pricing_mode': 'fixed',
        'complexity': 'basic',
        'requires_visit': True,
        'active': True,
        'is_visible': True,
        'is_core': False
    },
    {
        'id': 'SP001',
        'feature_id': 'F7',
        'name': 'Special Works Assessment',
        'description': 'Assessment for special project works',
        'base_price': 0,
        'domain': 'special',
        'service_kind': 'project_entry',
        'pricing_mode': 'project_quote',
        'complexity': 'project',
        'requires_visit': False,
        'active': True,
        'is_visible': False,
        'is_core': False
    }
]

SERVICE_MAPPING_FIELDS = {
    'feature_id',
    'name',
    'description',
    'base_price',
    'domain',
    'service_kind',
    'pricing_mode',
    'complexity',
    'requires_visit',
    'active',
    'is_visible',
    'is_core',
}


def seed_baseline():
    app = create_app()
    with app.app_context():
        created_features = 0
        created_services = 0

        for feature_data in BASE_FEATURES:
            if not Feature.query.get(feature_data['id']):
                db.session.add(Feature(**feature_data))
                created_features += 1

        for service_data in BASE_SERVICES:
            service = Service.query.get(service_data['id'])
            if not service:
                db.session.add(Service(**service_data))
                created_services += 1
            else:
                for field in SERVICE_MAPPING_FIELDS:
                    setattr(service, field, service_data[field])

        db.session.commit()

        print("Baseline seed completed")
        print(f"Features created: {created_features}")
        print(f"Services created: {created_services}")


if __name__ == '__main__':
    seed_baseline()
