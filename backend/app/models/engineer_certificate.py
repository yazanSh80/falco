"""
Engineer Certificate Model for FalcoElectrec
Allows engineers to upload multiple certificates.
"""
from datetime import datetime
from ..extensions import db


class EngineerCertificate(db.Model):
    """Model for storing engineer certificates."""
    
    __tablename__ = 'engineer_certificates'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    certificate_url = db.Column(db.String(255), nullable=False)
    certificate_name = db.Column(db.String(100), nullable=True)  # Original filename
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = db.relationship('User', backref='certificates')
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'certificate_url': self.certificate_url,
            'certificate_name': self.certificate_name,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }
    
    def __repr__(self):
        return f'<EngineerCertificate user_id={self.user_id} id={self.id}>'
