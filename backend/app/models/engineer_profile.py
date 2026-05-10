"""
Engineer Profile Model for FalcoElectrec
"""
from datetime import datetime, date
from enum import Enum
from sqlalchemy.orm import validates
from ..extensions import db


class SubscriptionStatus(str, Enum):
    ACTIVE = 'active'
    EXPIRED = 'expired'


class EngineerProfile(db.Model):
    """Extended profile for engineers."""
    
    __tablename__ = 'engineer_profiles'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    specialization = db.Column(db.String(100), nullable=False)
    domain = db.Column(db.String(30), nullable=False, default='electrical')
    years_exp = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text, nullable=True)
    cv_url = db.Column(db.String(255), nullable=True)
    certificate_url = db.Column(db.String(255), nullable=True)
    rating_avg = db.Column(db.Float, default=0.0)
    rating_count = db.Column(db.Integer, default=0)
    subscription_status = db.Column(db.String(20), default=SubscriptionStatus.ACTIVE.value)
    subscription_expiry = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    portfolio_items = db.relationship('PortfolioItem', backref='engineer', lazy='dynamic', cascade='all, delete-orphan')

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

    @validates('domain')
    def validate_domain(self, key, value):
        if value not in self.ALLOWED_DOMAINS:
            raise ValueError(f"Invalid domain: {value}")
        return value
    
    def is_subscription_active(self):
        """Check if subscription is currently active."""
        if self.subscription_status != SubscriptionStatus.ACTIVE.value:
            return False
        if self.subscription_expiry and self.subscription_expiry < date.today():
            return False
        return True
    
    def update_rating(self, new_rating):
        """Update average rating with a new review rating."""
        total = self.rating_avg * self.rating_count + new_rating
        self.rating_count += 1
        self.rating_avg = round(total / self.rating_count, 2)
    
    def to_dict(self):
        """Convert profile to dictionary."""
        return {
            'user_id': self.user_id,
            'specialization': self.specialization,
            'domain': self.domain,
            'years_exp': self.years_exp,
            'bio': self.bio,
            'cv_url': self.cv_url,
            'certificate_url': self.certificate_url,
            'rating_avg': self.rating_avg,
            'rating_count': self.rating_count,
            'subscription_status': self.subscription_status,
            'subscription_expiry': self.subscription_expiry.isoformat() if self.subscription_expiry else None,
            'is_subscription_active': self.is_subscription_active()
        }
    
    def __repr__(self):
        return f'<EngineerProfile user_id={self.user_id}>'
