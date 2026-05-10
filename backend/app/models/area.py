"""
Area Model for FalcoElectrec
Manages service areas/regions where engineers operate.
"""
from datetime import datetime
from ..extensions import db


class Area(db.Model):
    """Service area/region model."""
    
    __tablename__ = 'areas'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    name_ar = db.Column(db.String(100), nullable=True)  # Arabic name
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Statistics (computed)
    @property
    def engineer_count(self):
        """Count of active engineers in this area."""
        from .user import User, UserRole, UserStatus
        return User.query.filter(
            User.role == UserRole.ENGINEER.value,
            User.status == UserStatus.ACTIVE.value,
            User.area == self.name
        ).count()
    
    @property
    def customer_count(self):
        """Count of active customers in this area."""
        from .user import User, UserRole, UserStatus
        return User.query.filter(
            User.role == UserRole.CUSTOMER.value,
            User.status == UserStatus.ACTIVE.value,
            User.area == self.name
        ).count()
    
    @property
    def request_count(self):
        """Count of requests from this area."""
        from .request import Request
        from .user import User
        return db.session.query(Request).join(
            User, Request.customer_id == User.id
        ).filter(User.area == self.name).count()
    
    def to_dict(self, include_stats=False):
        """Convert to dictionary."""
        data = {
            'id': self.id,
            'name': self.name,
            'name_ar': self.name_ar,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_stats:
            data['stats'] = {
                'engineer_count': self.engineer_count,
                'customer_count': self.customer_count,
                'request_count': self.request_count
            }
        
        return data
    
    @classmethod
    def get_active_areas(cls):
        """Get all active areas."""
        return cls.query.filter_by(is_active=True).order_by(cls.name).all()
    
    @classmethod
    def get_or_create(cls, name):
        """Get area by name or create if not exists."""
        area = cls.query.filter_by(name=name).first()
        if not area:
            area = cls(name=name, is_active=True)
            db.session.add(area)
        return area
    
    def can_be_deleted(self):
        """Check if area can be safely deleted (no users assigned)."""
        from .user import User
        user_count = User.query.filter_by(area=self.name).count()
        return user_count == 0
    
    def __repr__(self):
        return f'<Area {self.name}>'
