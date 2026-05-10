"""
User Model for FalcoElectrec
"""
from datetime import datetime
from enum import Enum
from werkzeug.security import generate_password_hash, check_password_hash
from ..extensions import db


class UserRole(str, Enum):
    CUSTOMER = 'customer'
    ENGINEER = 'engineer'
    ADMIN = 'admin'


class UserStatus(str, Enum):
    ACTIVE = 'active'
    BLOCKED = 'blocked'
    PENDING = 'pending'


class User(db.Model):
    """User model for all platform users."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default=UserRole.CUSTOMER.value)
    status = db.Column(db.String(20), nullable=False, default=UserStatus.ACTIVE.value)
    city = db.Column(db.String(100), nullable=True)
    area = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    engineer_profile = db.relationship('EngineerProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    customer_requests = db.relationship('Request', backref='customer', foreign_keys='Request.customer_id', lazy='dynamic')
    engineer_jobs = db.relationship('Request', backref='engineer', foreign_keys='Request.engineer_id', lazy='dynamic')
    reviews_given = db.relationship('Review', backref='reviewer', foreign_keys='Review.reviewer_id', lazy='dynamic')
    reviews_received = db.relationship('Review', backref='reviewee', foreign_keys='Review.reviewee_id', lazy='dynamic')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    blocks_made = db.relationship('Block', backref='blocker', foreign_keys='Block.blocker_id', lazy='dynamic')
    blocks_received = db.relationship('Block', backref='blocked', foreign_keys='Block.blocked_id', lazy='dynamic')
    
    def set_password(self, password):
        """Hash and set the user's password."""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches the hash."""
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        """Check if user is an admin."""
        return self.role == UserRole.ADMIN.value
    
    def is_engineer(self):
        """Check if user is an engineer."""
        return self.role == UserRole.ENGINEER.value
    
    def is_customer(self):
        """Check if user is a customer."""
        return self.role == UserRole.CUSTOMER.value
    
    def is_active(self):
        """Check if user account is active."""
        return self.status == UserStatus.ACTIVE.value
    
    def is_blocked(self):
        """Check if user is blocked."""
        return self.status == UserStatus.BLOCKED.value
    
    def to_dict(self, include_profile=False):
        """Convert user to dictionary."""
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'status': self.status,
            'city': self.city,
            'area': self.area,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_profile and self.is_engineer() and self.engineer_profile:
            data['profile'] = self.engineer_profile.to_dict()
        
        return data
    
    def __repr__(self):
        return f'<User {self.email}>'
