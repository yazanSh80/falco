"""
Token Blocklist Model for FalcoElectrec
Used for invalidating JWT tokens (force logout, security)
"""
from datetime import datetime
from ..extensions import db


class TokenBlocklist(db.Model):
    """Model for storing revoked JWT tokens."""
    
    __tablename__ = 'token_blocklist'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True, unique=True)  # JWT ID
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    token_type = db.Column(db.String(10), nullable=False)  # 'access' or 'refresh'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)
    revoked_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    reason = db.Column(db.String(255), nullable=True)
    
    @classmethod
    def add_token(cls, jti, token_type, user_id=None, expires_at=None, revoked_by=None, reason=None):
        """Add a token to the blocklist."""
        blocked_token = cls(
            jti=jti,
            user_id=user_id,
            token_type=token_type,
            expires_at=expires_at,
            revoked_by=revoked_by,
            reason=reason
        )
        db.session.add(blocked_token)
        return blocked_token
    
    @classmethod
    def is_blocked(cls, jti):
        """Check if a token is blocked."""
        return cls.query.filter_by(jti=jti).first() is not None
    
    @classmethod
    def cleanup_expired(cls):
        """Remove expired tokens from the blocklist."""
        now = datetime.utcnow()
        cls.query.filter(cls.expires_at < now).delete()
        db.session.commit()
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            'id': self.id,
            'jti': self.jti,
            'user_id': self.user_id,
            'token_type': self.token_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'revoked_by': self.revoked_by,
            'reason': self.reason
        }
    
    def __repr__(self):
        return f'<TokenBlocklist {self.jti}>'
