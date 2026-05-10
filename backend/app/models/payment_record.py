"""
Payment lite model for manual platform operations.
"""
from datetime import datetime
from enum import Enum

from ..extensions import db


class PaymentMethod(str, Enum):
    CASH = 'cash'
    BANK_TRANSFER = 'bank_transfer'
    WALLET = 'wallet'


class PaymentStatus(str, Enum):
    PENDING = 'pending'
    PROOF_SUBMITTED = 'proof_submitted'
    CONFIRMED = 'confirmed'
    REJECTED = 'rejected'


class PaymentPurpose(str, Enum):
    SERVICE = 'service'
    INSPECTION = 'inspection'
    PROJECT_DIRECTION = 'project_direction'


class PaymentRecord(db.Model):
    """Manual/cash/proof-based payment record."""

    __tablename__ = 'payment_records'

    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('requests.id'), nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    engineer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    method = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(30), nullable=False, default=PaymentStatus.PENDING.value, index=True)
    purpose = db.Column(db.String(30), nullable=False)
    amount = db.Column(db.Float, nullable=False, default=0)
    proof_reference = db.Column(db.String(255), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    commission_rate = db.Column(db.Float, nullable=False, default=0)
    commission_amount = db.Column(db.Float, nullable=False, default=0)
    net_amount = db.Column(db.Float, nullable=False, default=0)
    confirmed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    confirmed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    ALLOWED_METHODS = {item.value for item in PaymentMethod}
    ALLOWED_STATUSES = {item.value for item in PaymentStatus}
    ALLOWED_PURPOSES = {item.value for item in PaymentPurpose}
    PAYOUT_SETTLEMENT_SCOPE = 'later_scope'

    @staticmethod
    def infer_purpose(service_request):
        """Infer minimal payment purpose from request intent."""
        intent = service_request.resolved_request_intent
        if intent == 'book_service':
            return PaymentPurpose.SERVICE.value
        if intent == 'project_special':
            return PaymentPurpose.PROJECT_DIRECTION.value
        return PaymentPurpose.INSPECTION.value

    @staticmethod
    def infer_amount(service_request, purpose):
        """Infer safe amount without creating online payment behavior."""
        if purpose == PaymentPurpose.SERVICE.value:
            if service_request.price_at_request is not None:
                return service_request.price_at_request
            if service_request.service:
                return service_request.service.base_price
        return 0

    def confirm(self, admin_id):
        """Confirm manual payment and snapshot commission fields."""
        from .transaction import Transaction

        commission_rate, commission_amount = Transaction.calculate_commission(self.amount)
        self.status = PaymentStatus.CONFIRMED.value
        self.commission_rate = commission_rate
        self.commission_amount = commission_amount
        self.net_amount = round(self.amount - commission_amount, 2)
        self.confirmed_by_id = admin_id
        self.confirmed_at = datetime.utcnow()

    def to_dict(self, include_request=False):
        """Convert payment record to dictionary."""
        data = {
            'id': self.id,
            'request_id': self.request_id,
            'customer_id': self.customer_id,
            'engineer_id': self.engineer_id,
            'method': self.method,
            'status': self.status,
            'purpose': self.purpose,
            'amount': self.amount,
            'proof_reference': self.proof_reference,
            'notes': self.notes,
            'commission_rate': self.commission_rate,
            'commission_amount': self.commission_amount,
            'net_amount': self.net_amount,
            'confirmed_by_id': self.confirmed_by_id,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'payout_settlement_scope': self.PAYOUT_SETTLEMENT_SCOPE
        }
        if include_request and self.request:
            data['request'] = {
                'request_number': self.request.request_number,
                'request_intent': self.request.resolved_request_intent,
                'category': self.request.category,
                'status': self.request.status
            }
        return data

    def __repr__(self):
        return f'<PaymentRecord {self.id} amount={self.amount} status={self.status}>'
