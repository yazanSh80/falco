"""
Service and Feature Models for FalcoElectrec
"""
from datetime import datetime
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
    
    def to_dict(self, include_services=False):
        """Convert feature to dictionary."""
        data = {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'description': self.description,
            'active': self.active
        }
        
        if include_services:
            data['services'] = [s.to_dict() for s in self.services.filter_by(active=True)]
        
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
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requests = db.relationship('Request', backref='service', lazy='dynamic')
    
    def to_dict(self, include_feature=False):
        """Convert service to dictionary."""
        data = {
            'id': self.id,
            'feature_id': self.feature_id,
            'name': self.name,
            'description': self.description,
            'base_price': self.base_price,
            'active': self.active
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
