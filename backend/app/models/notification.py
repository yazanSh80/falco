"""
Notification Model for FalcoElectrec
"""
from datetime import datetime
from enum import Enum
from ..extensions import db


class NotificationType(str, Enum):
    REQUEST_CREATED = 'request_created'
    REQUEST_ACCEPTED = 'request_accepted'
    REQUEST_COMPLETED = 'request_completed'
    REQUEST_CANCELLED = 'request_cancelled'
    REVIEW_RECEIVED = 'review_received'
    ACCOUNT_APPROVED = 'account_approved'
    ACCOUNT_REJECTED = 'account_rejected'
    SUBSCRIPTION_EXPIRING = 'subscription_expiring'
    GENERAL = 'general'


class Notification(db.Model):
    """In-app notification model."""
    
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, default=NotificationType.GENERAL.value)
    title = db.Column(db.String(100), nullable=False)
    body = db.Column(db.Text, nullable=True)
    read = db.Column(db.Boolean, default=False, index=True)
    reference_id = db.Column(db.Integer, nullable=True)  # ID of related request/review
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    @staticmethod
    def create_notification(user_id, type, title, body=None, reference_id=None):
        """Helper to create a notification."""
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            reference_id=reference_id
        )
        db.session.add(notification)
        return notification
    
    @staticmethod
    def notify_request_created(customer_id, request_number):
        """Notify customer that their request was created."""
        return Notification.create_notification(
            user_id=customer_id,
            type=NotificationType.REQUEST_CREATED.value,
            title='Request Created',
            body=f'Your service request {request_number} has been created successfully.'
        )
    
    @staticmethod
    def notify_request_accepted(customer_id, engineer_name, request_number):
        """Notify customer that their request was accepted."""
        return Notification.create_notification(
            user_id=customer_id,
            type=NotificationType.REQUEST_ACCEPTED.value,
            title='Request Accepted',
            body=f'{engineer_name} has accepted your request {request_number}.'
        )
    
    @staticmethod
    def notify_request_completed(customer_id, request_number):
        """Notify customer that their request was completed."""
        return Notification.create_notification(
            user_id=customer_id,
            type=NotificationType.REQUEST_COMPLETED.value,
            title='Request Completed',
            body=f'Your request {request_number} has been marked as completed.'
        )
    
    @staticmethod
    def notify_review_received(user_id, reviewer_name, rating):
        """Notify user that they received a review."""
        return Notification.create_notification(
            user_id=user_id,
            type=NotificationType.REVIEW_RECEIVED.value,
            title='New Review Received',
            body=f'{reviewer_name} gave you a {rating}-star rating.'
        )
    
    @staticmethod
    def notify_account_approved(engineer_id):
        """Notify engineer that their account was approved."""
        return Notification.create_notification(
            user_id=engineer_id,
            type=NotificationType.ACCOUNT_APPROVED.value,
            title='Account Approved',
            body='Congratulations! Your engineer account has been approved. You can now accept jobs.'
        )
    
    @staticmethod
    def notify_account_rejected(engineer_id, reason=None):
        """Notify engineer that their account was rejected."""
        body = 'Your engineer application has been rejected.'
        if reason:
            body += f' Reason: {reason}'
        return Notification.create_notification(
            user_id=engineer_id,
            type=NotificationType.ACCOUNT_REJECTED.value,
            title='Account Rejected',
            body=body
        )
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.read = True
    
    def to_dict(self):
        """Convert notification to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'body': self.body,
            'read': self.read,
            'reference_id': self.reference_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Notification {self.id} to user {self.user_id}>'
