"""
Engineer Approval Request Model for FalcoElectrec
Tracks all pending engineer signup requests visible to admins.
"""
from datetime import datetime
from enum import Enum
from ..extensions import db


class ApprovalStatus(str, Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'


class EngineerApprovalRequest(db.Model):
    """Model for tracking engineer approval requests."""
    
    __tablename__ = 'engineer_approval_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True, unique=True)
    
    # Engineer details (denormalized for easy admin access)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    area = db.Column(db.String(100), nullable=True)
    specialization = db.Column(db.String(100), nullable=False)
    years_exp = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text, nullable=True)
    
    # Status and tracking
    status = db.Column(db.String(20), nullable=False, default=ApprovalStatus.PENDING.value, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Admin action tracking
    reviewed_by_admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    review_date = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='approval_request')
    reviewed_by_admin = db.relationship('User', foreign_keys=[reviewed_by_admin_id])
    
    def to_dict(self):
        """Convert approval request to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'city': self.city,
            'area': self.area,
            'specialization': self.specialization,
            'years_exp': self.years_exp,
            'bio': self.bio,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'reviewed_by_admin_id': self.reviewed_by_admin_id,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'rejection_reason': self.rejection_reason
        }
    
    def __repr__(self):
        return f'<EngineerApprovalRequest user_id={self.user_id} status={self.status}>'
