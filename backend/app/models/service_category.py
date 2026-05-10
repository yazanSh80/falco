"""
Service Category Model for FalcoElectrec
Expandable structure for service categories/types.
Supports parent/child hierarchy and metadata for future expansion.
"""
from datetime import datetime
from ..extensions import db


class ServiceCategory(db.Model):
    """Service category/type model - expandable structure."""
    
    __tablename__ = 'service_categories'
    
    id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, index=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    parent_id = db.Column(db.String(10), db.ForeignKey('service_categories.id'), nullable=True)
    metadata_json = db.Column('metadata', db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = db.relationship('ServiceCategory', remote_side=[id], backref='children')
    
    def to_dict(self, include_children=False, include_services=False):
        """Convert category to dictionary."""
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'is_active': self.is_active,
            'parent_id': self.parent_id,
            'metadata': self.metadata_json or {},
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_children:
            data['children'] = [c.to_dict(include_children=False) for c in self.children if c.is_active]
        
        if include_services:
            data['services'] = []
        
        return data
    
    def __repr__(self):
        return f'<ServiceCategory {self.name} (active={self.is_active})>'
