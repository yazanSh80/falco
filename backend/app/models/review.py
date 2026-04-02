"""
Review Model for FalcoElectrec
"""
from datetime import datetime
from ..extensions import db


class Review(db.Model):
    """Review/rating model."""
    
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('requests.id'), nullable=False, index=True)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    reviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
        db.UniqueConstraint('request_id', 'reviewer_id', name='unique_review_per_request_per_user'),
    )
    
    def to_dict(self, include_users=False):
        """Convert review to dictionary."""
        data = {
            'id': self.id,
            'request_id': self.request_id,
            'reviewer_id': self.reviewer_id,
            'reviewee_id': self.reviewee_id,
            'rating': self.rating,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_users:
            if self.reviewer:
                data['reviewer'] = {
                    'id': self.reviewer.id,
                    'name': self.reviewer.name
                }
            if self.reviewee:
                data['reviewee'] = {
                    'id': self.reviewee.id,
                    'name': self.reviewee.name
                }
        
        return data
    
    def __repr__(self):
        return f'<Review {self.id} rating={self.rating}>'
