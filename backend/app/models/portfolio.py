"""
Portfolio Item Model for FalcoElectrec
"""
from datetime import datetime
from ..extensions import db


class PortfolioItem(db.Model):
    """Engineer portfolio item model."""
    
    __tablename__ = 'portfolio_items'
    
    id = db.Column(db.Integer, primary_key=True)
    engineer_id = db.Column(db.Integer, db.ForeignKey('engineer_profiles.user_id'), nullable=False, index=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert portfolio item to dictionary."""
        return {
            'id': self.id,
            'engineer_id': self.engineer_id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<PortfolioItem {self.id} "{self.title}">'
