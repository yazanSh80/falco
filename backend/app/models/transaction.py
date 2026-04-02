"""
Transaction Model for FalcoElectrec
"""
from datetime import datetime
from ..extensions import db


class Transaction(db.Model):
    """Financial transaction model."""
    
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('requests.id'), nullable=False, unique=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    engineer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    gross_amount = db.Column(db.Float, nullable=False)
    commission_rate = db.Column(db.Float, nullable=False)  # 0.0 or 0.05
    commission_amount = db.Column(db.Float, nullable=False)
    net_amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Commission thresholds
    COMMISSION_THRESHOLD = 700  # NIS
    COMMISSION_RATE_ABOVE = 0.05  # 5%
    
    @classmethod
    def calculate_commission(cls, gross_amount):
        """Calculate commission based on amount.
        
        Rules:
        - <= 700 NIS: 0% commission
        - > 700 NIS: 5% commission
        """
        if gross_amount <= cls.COMMISSION_THRESHOLD:
            return 0.0, 0.0
        else:
            commission = gross_amount * cls.COMMISSION_RATE_ABOVE
            return cls.COMMISSION_RATE_ABOVE, round(commission, 2)
    
    @classmethod
    def create_for_request(cls, request):
        """Create a transaction for a completed request."""
        gross_amount = request.price_at_request or 0
        
        if gross_amount <= 0:
            # Try to get price from service
            if request.service:
                gross_amount = request.service.base_price
        
        commission_rate, commission_amount = cls.calculate_commission(gross_amount)
        net_amount = round(gross_amount - commission_amount, 2)
        
        transaction = cls(
            request_id=request.id,
            customer_id=request.customer_id,
            engineer_id=request.engineer_id,
            gross_amount=gross_amount,
            commission_rate=commission_rate,
            commission_amount=commission_amount,
            net_amount=net_amount
        )
        
        db.session.add(transaction)
        return transaction
    
    def to_dict(self, include_details=False):
        """Convert transaction to dictionary."""
        data = {
            'id': self.id,
            'request_id': self.request_id,
            'customer_id': self.customer_id,
            'engineer_id': self.engineer_id,
            'gross_amount': self.gross_amount,
            'commission_rate': self.commission_rate,
            'commission_amount': self.commission_amount,
            'net_amount': self.net_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_details and self.request:
            data['request'] = {
                'request_number': self.request.request_number,
                'description': self.request.description,
                'service_name': self.request.service.name if self.request.service else self.request.category
            }
        
        return data
    
    def __repr__(self):
        return f'<Transaction {self.id} amount={self.gross_amount}>'
