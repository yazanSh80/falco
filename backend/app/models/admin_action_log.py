"""
Admin Action Log Model for FalcoElectrec
Tracks all administrative actions for audit purposes.
"""
from datetime import datetime
from enum import Enum
from ..extensions import db


class AdminActionType(str, Enum):
    """Types of admin actions that are logged."""
    APPROVE_ENGINEER = 'approve_engineer'
    REJECT_ENGINEER = 'reject_engineer'
    BLOCK_USER = 'block_user'
    UNBLOCK_USER = 'unblock_user'
    DELETE_USER = 'delete_user'
    CREATE_ADMIN = 'create_admin'
    RESOLVE_DISPUTE = 'resolve_dispute'
    REJECT_DISPUTE = 'reject_dispute'
    UPDATE_DISPUTE_STATUS = 'update_dispute_status'
    CREATE_SERVICE = 'create_service'
    MODIFY_SERVICE = 'modify_service'
    SYSTEM_CONFIG = 'system_config'
    FORCE_LOGOUT = 'force_logout'
    DISABLE_LOGIN = 'disable_login'
    RESET_SUBSCRIPTION = 'reset_subscription'
    CANCEL_REQUEST = 'cancel_request'
    CREATE_AREA = 'create_area'
    UPDATE_AREA = 'update_area'
    DELETE_AREA = 'delete_area'
    UPDATE_ENGINEER_PERMISSIONS = 'update_engineer_permissions'
    EXPORT_ENGINEERS = 'export_engineers'
    EXPORT_FINANCE = 'export_finance'
    EXPORT_REQUESTS = 'export_requests'
    EXPORT_USERS = 'export_users'


class AdminActionLog(db.Model):
    """Model for tracking admin actions."""
    
    __tablename__ = 'admin_action_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    action_type = db.Column(db.String(50), nullable=False, index=True)
    target_type = db.Column(db.String(50), nullable=True)  # 'user', 'dispute', 'service', etc.
    target_id = db.Column(db.Integer, nullable=True, index=True)
    details_json = db.Column(db.JSON, nullable=True)  # Additional action details
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationship to admin user
    admin = db.relationship('User', backref='admin_actions', foreign_keys=[admin_id])
    
    @classmethod
    def log(cls, admin_id, action_type, target_type=None, target_id=None, 
            details=None, ip_address=None, user_agent=None):
        """
        Create a new audit log entry.
        
        Args:
            admin_id: ID of the admin performing the action
            action_type: Type of action (from AdminActionType enum)
            target_type: Type of target entity (user, dispute, etc.)
            target_id: ID of the target entity
            details: Dictionary with additional details
            ip_address: IP address of the admin
            user_agent: User agent string
            
        Returns:
            AdminActionLog instance
        """
        log_entry = cls(
            admin_id=admin_id,
            action_type=action_type.value if isinstance(action_type, AdminActionType) else action_type,
            target_type=target_type,
            target_id=target_id,
            details_json=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(log_entry)
        return log_entry
    
    def to_dict(self, include_admin=False):
        """Convert to dictionary."""
        data = {
            'id': self.id,
            'admin_id': self.admin_id,
            'action_type': self.action_type,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'details': self.details_json,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_admin and self.admin:
            data['admin'] = {
                'id': self.admin.id,
                'name': self.admin.name,
                'email': self.admin.email
            }
        
        return data
    
    def __repr__(self):
        return f'<AdminActionLog {self.id} {self.action_type} by admin {self.admin_id}>'
