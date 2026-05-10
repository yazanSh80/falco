"""
Block Model for FalcoElectrec
"""
from datetime import datetime
from ..extensions import db


class Block(db.Model):
    """User blocking relationship model."""
    
    __tablename__ = 'blocks'
    
    id = db.Column(db.Integer, primary_key=True)
    blocker_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    blocked_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('blocker_id', 'blocked_id', name='unique_block'),
        db.CheckConstraint('blocker_id != blocked_id', name='no_self_block'),
    )
    
    @staticmethod
    def is_blocked(user1_id, user2_id):
        """Check if there's a block between two users (either direction)."""
        return Block.query.filter(
            db.or_(
                db.and_(Block.blocker_id == user1_id, Block.blocked_id == user2_id),
                db.and_(Block.blocker_id == user2_id, Block.blocked_id == user1_id)
            )
        ).first() is not None
    
    @staticmethod
    def get_blocked_ids(user_id):
        """Get list of user IDs that are blocked by or have blocked this user."""
        blocks = Block.query.filter(
            db.or_(Block.blocker_id == user_id, Block.blocked_id == user_id)
        ).all()
        
        blocked_ids = set()
        for block in blocks:
            if block.blocker_id == user_id:
                blocked_ids.add(block.blocked_id)
            else:
                blocked_ids.add(block.blocker_id)
        
        return list(blocked_ids)
    
    def to_dict(self, include_users=False):
        """Convert block to dictionary."""
        data = {
            'id': self.id,
            'blocker_id': self.blocker_id,
            'blocked_id': self.blocked_id,
            'reason': self.reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_users:
            if self.blocker:
                data['blocker'] = {
                    'id': self.blocker.id,
                    'name': self.blocker.name
                }
            if self.blocked:
                data['blocked'] = {
                    'id': self.blocked.id,
                    'name': self.blocked.name
                }
        
        return data
    
    def __repr__(self):
        return f'<Block {self.blocker_id} -> {self.blocked_id}>'
