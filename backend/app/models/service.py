"""
Service and Feature Models for FalcoElectrec
"""
from datetime import datetime
from sqlalchemy.orm import validates
from ..extensions import db


class Feature(db.Model):
    """Service category/feature model."""
    
    __tablename__ = 'features'
    
    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50), nullable=True)
    description = db.Column(db.Text, nullable=True)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    services = db.relationship('Service', backref='feature', lazy='dynamic')
    
    def to_dict(self, include_services=False, include_inactive=False, include_hidden=False, include_non_core=False):
        """Convert feature to dictionary."""
        data = {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'description': self.description,
            'active': self.active
        }
        
        if include_services:
            query = self.services
            if not include_inactive:
                query = query.filter_by(active=True)
            if not include_hidden:
                query = query.filter_by(is_visible=True)
            if not include_non_core:
                query = query.filter_by(is_core=True)
            data['services'] = [s.to_dict() for s in query]
        
        return data
    
    def __repr__(self):
        return f'<Feature {self.name}>'


class Service(db.Model):
    """Individual service model."""
    
    __tablename__ = 'services'
    
    id = db.Column(db.String(10), primary_key=True)
    feature_id = db.Column(db.String(10), db.ForeignKey('features.id'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    base_price = db.Column(db.Float, nullable=False)
    domain = db.Column(db.String(30), nullable=False, default='electrical')
    service_kind = db.Column(db.String(30), nullable=False, default='standard_service')
    pricing_mode = db.Column(db.String(30), nullable=False, default='fixed')
    complexity = db.Column(db.String(30), nullable=False, default='standard')
    requires_visit = db.Column(db.Boolean, default=True)
    active = db.Column(db.Boolean, default=True)
    is_visible = db.Column(db.Boolean, default=True)
    is_core = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requests = db.relationship('Request', backref='service', lazy='dynamic')

    ALLOWED_DOMAINS = {
        'electrical',
        'ac',
        'low_current',
        'solar',
        'fiber',
        'smart',
        'special',
        'legacy'
    }
    ALLOWED_SERVICE_KINDS = {
        'standard_service',
        'inspection',
        'consultation',
        'project_entry',
        'legacy_service'
    }
    ALLOWED_PRICING_MODES = {
        'fixed',
        'after_visit',
        'inspection_fee',
        'project_quote',
        'not_applicable'
    }
    ALLOWED_COMPLEXITIES = {
        'basic',
        'standard',
        'advanced',
        'project'
    }

    @validates('domain')
    def validate_domain(self, key, value):
        if value not in self.ALLOWED_DOMAINS:
            raise ValueError(f"Invalid domain: {value}")
        return value

    @validates('service_kind')
    def validate_service_kind(self, key, value):
        if value not in self.ALLOWED_SERVICE_KINDS:
            raise ValueError(f"Invalid service_kind: {value}")
        return value

    @validates('pricing_mode')
    def validate_pricing_mode(self, key, value):
        if value not in self.ALLOWED_PRICING_MODES:
            raise ValueError(f"Invalid pricing_mode: {value}")
        return value

    @validates('complexity')
    def validate_complexity(self, key, value):
        if value not in self.ALLOWED_COMPLEXITIES:
            raise ValueError(f"Invalid complexity: {value}")
        return value
    
    def to_dict(self, include_feature=False):
        """Convert service to dictionary."""
        data = {
            'id': self.id,
            'feature_id': self.feature_id,
            'name': self.name,
            'description': self.description,
            'base_price': self.base_price,
            'domain': self.domain,
            'service_kind': self.service_kind,
            'pricing_mode': self.pricing_mode,
            'complexity': self.complexity,
            'requires_visit': self.requires_visit,
            'active': self.active,
            'is_visible': self.is_visible,
            'is_core': self.is_core
        }
        
        if include_feature and self.feature:
            data['feature'] = {
                'id': self.feature.id,
                'name': self.feature.name,
                'icon': self.feature.icon
            }
        
        return data
    
    def __repr__(self):
        return f'<Service {self.name}>'
