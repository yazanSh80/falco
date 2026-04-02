"""
Request Model for FalcoElectrec
"""
from datetime import datetime, timedelta
from enum import Enum
from ..extensions import db


class RequestType(str, Enum):
    QUICK = 'quick'
    LATE = 'late'


class RequestStatus(str, Enum):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'


# SLA Configuration (in hours)
SLA_CONFIG = {
    'quick': {
        'response_time': 2,      # Hours to accept
        'completion_time': 24    # Hours to complete after acceptance
    },
    'late': {
        'response_time': 24,     # Hours to accept
        'completion_time': 72    # Hours to complete after acceptance
    }
}


class Request(db.Model):
    """Service request model."""
    
    __tablename__ = 'requests'
    
    id = db.Column(db.Integer, primary_key=True)
    request_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    service_id = db.Column(db.String(10), db.ForeignKey('services.id'), nullable=True)
    type = db.Column(db.String(10), nullable=False, default=RequestType.QUICK.value)
    category = db.Column(db.String(100), nullable=True)  # For quick requests without specific service
    description = db.Column(db.Text, nullable=False)
    location_text = db.Column(db.String(255), nullable=False)
    location_lat = db.Column(db.Float, nullable=True)
    location_lng = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), nullable=False, default=RequestStatus.PENDING.value, index=True)
    engineer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    price_at_request = db.Column(db.Float, nullable=True)
    preferred_time = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    accepted_at = db.Column(db.DateTime, nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)  # When work actually started
    completed_at = db.Column(db.DateTime, nullable=True)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    
    # SLA tracking
    sla_response_deadline = db.Column(db.DateTime, nullable=True)
    sla_completion_deadline = db.Column(db.DateTime, nullable=True)
    sla_response_breached = db.Column(db.Boolean, default=False)
    sla_completion_breached = db.Column(db.Boolean, default=False)
    
    # Relationships
    reviews = db.relationship('Review', backref='request', lazy='dynamic')
    transaction = db.relationship('Transaction', backref='request', uselist=False)
    
    @staticmethod
    def generate_request_number():
        """Generate a unique request number."""
        last_request = Request.query.order_by(Request.id.desc()).first()
        if last_request:
            num = last_request.id + 1
        else:
            num = 1
        return f'R-{num:04d}'
    
    def set_sla_deadlines(self):
        """Set SLA deadlines based on request type."""
        sla = SLA_CONFIG.get(self.type, SLA_CONFIG['quick'])
        self.sla_response_deadline = self.created_at + timedelta(hours=sla['response_time'])
    
    def check_sla_breach(self):
        """Check and update SLA breach status."""
        now = datetime.utcnow()
        
        # Response SLA - check if not yet accepted and past deadline
        if self.status == RequestStatus.PENDING.value:
            if self.sla_response_deadline and now > self.sla_response_deadline:
                self.sla_response_breached = True
        
        # Completion SLA - check if accepted but not completed
        if self.status in [RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value]:
            if self.sla_completion_deadline and now > self.sla_completion_deadline:
                self.sla_completion_breached = True
        
        return self.sla_response_breached or self.sla_completion_breached
    
    @property
    def response_time_hours(self):
        """Calculate response time in hours."""
        if self.accepted_at and self.created_at:
            delta = self.accepted_at - self.created_at
            return round(delta.total_seconds() / 3600, 2)
        return None
    
    @property
    def completion_time_hours(self):
        """Calculate completion time from acceptance in hours."""
        if self.completed_at and self.accepted_at:
            delta = self.completed_at - self.accepted_at
            return round(delta.total_seconds() / 3600, 2)
        return None
    
    @property
    def total_duration_hours(self):
        """Calculate total duration from creation to completion in hours."""
        if self.completed_at and self.created_at:
            delta = self.completed_at - self.created_at
            return round(delta.total_seconds() / 3600, 2)
        return None
    
    @property
    def sla_status(self):
        """Get current SLA status."""
        now = datetime.utcnow()
        
        if self.status == RequestStatus.COMPLETED.value:
            if self.sla_response_breached or self.sla_completion_breached:
                return 'breached'
            return 'met'
        
        if self.status == RequestStatus.CANCELLED.value:
            return 'cancelled'
        
        # Check if at risk
        if self.status == RequestStatus.PENDING.value:
            if self.sla_response_deadline:
                time_left = (self.sla_response_deadline - now).total_seconds() / 3600
                if time_left < 0:
                    return 'breached'
                if time_left < 1:  # Less than 1 hour
                    return 'at_risk'
        
        if self.status in [RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value]:
            if self.sla_completion_deadline:
                time_left = (self.sla_completion_deadline - now).total_seconds() / 3600
                if time_left < 0:
                    return 'breached'
                if time_left < 4:  # Less than 4 hours
                    return 'at_risk'
        
        return 'on_track'
    
    def can_be_accepted(self):
        """Check if request can be accepted."""
        return self.status == RequestStatus.PENDING.value
    
    def can_be_completed(self):
        """Check if request can be marked as completed."""
        return self.status in [RequestStatus.ACCEPTED.value, RequestStatus.IN_PROGRESS.value]
    
    def can_be_cancelled(self):
        """Check if request can be cancelled."""
        return self.status in [RequestStatus.PENDING.value, RequestStatus.ACCEPTED.value]
    
    def accept(self, engineer_id):
        """Accept the request by an engineer."""
        self.engineer_id = engineer_id
        self.status = RequestStatus.ACCEPTED.value
        self.accepted_at = datetime.utcnow()
        
        # Set completion deadline
        sla = SLA_CONFIG.get(self.type, SLA_CONFIG['quick'])
        self.sla_completion_deadline = self.accepted_at + timedelta(hours=sla['completion_time'])
        
        # Check if response SLA was breached
        if self.sla_response_deadline and self.accepted_at > self.sla_response_deadline:
            self.sla_response_breached = True
    
    def start_work(self):
        """Mark that work has started."""
        self.status = RequestStatus.IN_PROGRESS.value
        self.started_at = datetime.utcnow()
    
    def complete(self):
        """Mark request as completed."""
        self.status = RequestStatus.COMPLETED.value
        self.completed_at = datetime.utcnow()
        
        # Check if completion SLA was breached
        if self.sla_completion_deadline and self.completed_at > self.sla_completion_deadline:
            self.sla_completion_breached = True
    
    def cancel(self):
        """Cancel the request."""
        self.status = RequestStatus.CANCELLED.value
        self.cancelled_at = datetime.utcnow()
    
    def to_dict(self, include_users=False, include_sla=False):
        """Convert request to dictionary."""
        data = {
            'id': self.id,
            'request_number': self.request_number,
            'customer_id': self.customer_id,
            'service_id': self.service_id,
            'type': self.type,
            'category': self.category,
            'description': self.description,
            'location_text': self.location_text,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'status': self.status,
            'engineer_id': self.engineer_id,
            'price_at_request': self.price_at_request,
            'preferred_time': self.preferred_time.isoformat() if self.preferred_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
        
        if include_sla:
            data['sla'] = {
                'response_deadline': self.sla_response_deadline.isoformat() if self.sla_response_deadline else None,
                'completion_deadline': self.sla_completion_deadline.isoformat() if self.sla_completion_deadline else None,
                'response_breached': self.sla_response_breached,
                'completion_breached': self.sla_completion_breached,
                'response_time_hours': self.response_time_hours,
                'completion_time_hours': self.completion_time_hours,
                'total_duration_hours': self.total_duration_hours,
                'status': self.sla_status
            }
        
        if include_users:
            if self.customer:
                data['customer'] = {
                    'id': self.customer.id,
                    'name': self.customer.name,
                    'email': self.customer.email,
                    'phone': self.customer.phone
                }
            if self.engineer:
                data['engineer'] = {
                    'id': self.engineer.id,
                    'name': self.engineer.name,
                    'email': self.engineer.email
                }
        
        if self.service:
            data['service'] = {
                'id': self.service.id,
                'name': self.service.name,
                'base_price': self.service.base_price
            }
        
        return data
    
    def __repr__(self):
        return f'<Request {self.request_number}>'
