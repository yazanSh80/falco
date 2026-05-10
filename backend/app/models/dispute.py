"""
Dispute Model for FalcoElectrec
Handles complaints and dispute resolution between customers and engineers.
"""
from datetime import datetime
from enum import Enum
from ..extensions import db


class DisputeStatus(str, Enum):
    OPEN = 'open'
    IN_REVIEW = 'in_review'
    RESOLVED = 'resolved'
    REJECTED = 'rejected'


class DisputeCategory(str, Enum):
    QUALITY = 'quality'  # Poor quality of work
    INCOMPLETE = 'incomplete'  # Work not completed as described
    OVERCHARGE = 'overcharge'  # Charged more than agreed
    DELAY = 'delay'  # Excessive delay
    BEHAVIOR = 'behavior'  # Unprofessional behavior
    DAMAGE = 'damage'  # Property damage
    OTHER = 'other'


class ResolutionAction(str, Enum):
    NO_ACTION = 'no_action'
    PARTIAL_REFUND = 'partial_refund'
    FULL_REFUND = 'full_refund'
    WARN_ENGINEER = 'warn_engineer'
    WARN_CUSTOMER = 'warn_customer'
    BLOCK_ENGINEER = 'block_engineer'
    BLOCK_CUSTOMER = 'block_customer'


class Dispute(db.Model):
    """Dispute/Complaint model for handling issues between users."""
    
    __tablename__ = 'disputes'
    
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('requests.id'), nullable=False, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    against_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default=DisputeStatus.OPEN.value, index=True)
    
    # Resolution fields
    resolved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    resolution_action = db.Column(db.String(50), nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)
    refund_amount = db.Column(db.Float, nullable=True)  # For partial/full refund
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    request = db.relationship('Request', backref=db.backref('disputes', lazy='dynamic'))
    creator = db.relationship('User', foreign_keys=[created_by], backref=db.backref('disputes_created', lazy='dynamic'))
    against_user = db.relationship('User', foreign_keys=[against_user_id], backref=db.backref('disputes_against', lazy='dynamic'))
    resolver = db.relationship('User', foreign_keys=[resolved_by], backref=db.backref('disputes_resolved', lazy='dynamic'))
    
    # Dispute window in days
    DISPUTE_WINDOW_DAYS = 7
    
    def can_be_resolved(self):
        """Check if dispute can be resolved."""
        return self.status in [DisputeStatus.OPEN.value, DisputeStatus.IN_REVIEW.value]
    
    def resolve(self, admin_id, action, notes=None, refund_amount=None):
        """Resolve the dispute with an action."""
        self.status = DisputeStatus.RESOLVED.value
        self.resolved_by = admin_id
        self.resolution_action = action
        self.resolution_notes = notes
        self.refund_amount = refund_amount
        self.resolved_at = datetime.utcnow()
    
    def reject(self, admin_id, notes=None):
        """Reject the dispute."""
        self.status = DisputeStatus.REJECTED.value
        self.resolved_by = admin_id
        self.resolution_action = ResolutionAction.NO_ACTION.value
        self.resolution_notes = notes
        self.resolved_at = datetime.utcnow()
    
    def set_in_review(self):
        """Mark dispute as in review."""
        self.status = DisputeStatus.IN_REVIEW.value
    
    def to_dict(self, include_users=False, include_request=False):
        """Convert dispute to dictionary."""
        data = {
            'id': self.id,
            'request_id': self.request_id,
            'created_by': self.created_by,
            'against_user_id': self.against_user_id,
            'category': self.category,
            'description': self.description,
            'status': self.status,
            'resolution_action': self.resolution_action,
            'resolution_notes': self.resolution_notes,
            'refund_amount': self.refund_amount,
            'resolved_by': self.resolved_by,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_users:
            data['creator'] = {
                'id': self.creator.id,
                'name': self.creator.name,
                'email': self.creator.email,
                'role': self.creator.role
            } if self.creator else None
            
            data['against'] = {
                'id': self.against_user.id,
                'name': self.against_user.name,
                'email': self.against_user.email,
                'role': self.against_user.role
            } if self.against_user else None
            
            data['resolved_by_user'] = {
                'id': self.resolver.id,
                'name': self.resolver.name
            } if self.resolver else None
        
        if include_request and self.request:
            data['request'] = {
                'id': self.request.id,
                'request_number': self.request.request_number,
                'status': self.request.status,
                'completed_at': self.request.completed_at.isoformat() if self.request.completed_at else None,
                'service': {
                    'id': self.request.service.id,
                    'name': self.request.service.name
                } if self.request.service else None
            }
        
        return data
    
    def __repr__(self):
        return f'<Dispute {self.id} - {self.status}>'


class DisputeAuditLog(db.Model):
    """Audit log for dispute actions."""
    
    __tablename__ = 'dispute_audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    dispute_id = db.Column(db.Integer, db.ForeignKey('disputes.id'), nullable=False, index=True)
    action = db.Column(db.String(50), nullable=False)  # created, status_changed, resolved, rejected
    old_status = db.Column(db.String(20), nullable=True)
    new_status = db.Column(db.String(20), nullable=True)
    performed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    details = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    dispute = db.relationship('Dispute', backref=db.backref('audit_logs', lazy='dynamic', order_by='DisputeAuditLog.created_at'))
    performer = db.relationship('User', backref=db.backref('dispute_actions', lazy='dynamic'))
    
    @classmethod
    def log_action(cls, dispute_id, action, performed_by, old_status=None, new_status=None, details=None):
        """Create an audit log entry."""
        log = cls(
            dispute_id=dispute_id,
            action=action,
            old_status=old_status,
            new_status=new_status,
            performed_by=performed_by,
            details=details
        )
        db.session.add(log)
        return log
    
    def to_dict(self):
        """Convert audit log to dictionary."""
        return {
            'id': self.id,
            'dispute_id': self.dispute_id,
            'action': self.action,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'performed_by': self.performed_by,
            'performer_name': self.performer.name if self.performer else None,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
