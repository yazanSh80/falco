"""
Marshmallow Schemas for FalcoElectrec API Validation
"""
from marshmallow import Schema, fields, validate, validates, ValidationError, post_load
import re


# ==================== Validators ====================

def validate_phone(value):
    """Validate Palestinian phone number format.
    
    Accepts formats:
    - 059XXXXXXX or 056XXXXXXX (10 digits)
    - 05XXXXXXXX (10 digits starting with 05)
    """
    if value:
        # Remove any spaces or dashes
        cleaned = re.sub(r'[\s\-]', '', value)
        # Accept 05X followed by 7-8 digits
        if not re.match(r'^05[0-9]{8}$', cleaned):
            raise ValidationError('Phone must be 10 digits starting with 05 (e.g., 0591234567)')


def validate_password(value):
    """Validate password strength.
    
    Requirements:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    """
    if len(value) < 8:
        raise ValidationError('Password must be at least 8 characters')
    if len(value) > 128:
        raise ValidationError('Password must be less than 128 characters')
    if not re.search(r'[A-Z]', value):
        raise ValidationError('Password must contain at least one uppercase letter')
    if not re.search(r'[a-z]', value):
        raise ValidationError('Password must contain at least one lowercase letter')
    if not re.search(r'\d', value):
        raise ValidationError('Password must contain at least one digit')


# ==================== Auth Schemas ====================

class RegisterSchema(Schema):
    """Schema for user registration."""
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate_password)
    role = fields.Str(required=True, validate=validate.OneOf(['customer', 'engineer']))
    phone = fields.Str(validate=validate_phone, allow_none=True)
    city = fields.Str(validate=validate.Length(max=100), allow_none=True)
    area = fields.Str(validate=validate.Length(max=100), allow_none=True)
    
    # Engineer-specific fields
    specialization = fields.Str(validate=validate.Length(max=100), allow_none=True)
    years_exp = fields.Int(validate=validate.Range(min=0, max=50), allow_none=True)
    bio = fields.Str(validate=validate.Length(max=1000), allow_none=True)


class LoginSchema(Schema):
    """Schema for user login."""
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)


class UpdateProfileSchema(Schema):
    """Schema for updating user profile."""
    name = fields.Str(validate=validate.Length(min=2, max=100))
    phone = fields.Str(validate=validate_phone, allow_none=True)
    city = fields.Str(validate=validate.Length(max=100))
    area = fields.Str(validate=validate.Length(max=100))
    bio = fields.Str(validate=validate.Length(max=1000))


# ==================== Request Schemas ====================

class CreateRequestSchema(Schema):
    """Schema for creating a service request."""
    type = fields.Str(required=True, validate=validate.OneOf(['quick', 'late']))
    service_id = fields.Str(allow_none=True)  # Required for 'late' type
    category = fields.Str(validate=validate.Length(max=100))
    description = fields.Str(required=True, validate=validate.Length(min=10, max=1000))
    location_text = fields.Str(required=True, validate=validate.Length(min=5, max=500))
    location_lat = fields.Float(allow_none=True)
    location_lng = fields.Float(allow_none=True)
    
    @validates('service_id')
    def validate_service_for_late(self, value):
        # This validation is done in the endpoint since we need request context
        pass


class UpdateRequestStatusSchema(Schema):
    """Schema for updating request status."""
    status = fields.Str(required=True, validate=validate.OneOf([
        'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
    ]))
    reason = fields.Str(validate=validate.Length(max=500), allow_none=True)


# ==================== Review Schemas ====================

class CreateReviewSchema(Schema):
    """Schema for creating a review."""
    request_id = fields.Int(required=True)
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    text = fields.Str(validate=validate.Length(max=1000), allow_none=True)


# ==================== Block Schemas ====================

class CreateBlockSchema(Schema):
    """Schema for blocking a user."""
    blocked_id = fields.Int(required=True)
    reason = fields.Str(validate=validate.Length(max=500), allow_none=True)


# ==================== Portfolio Schemas ====================

class CreatePortfolioItemSchema(Schema):
    """Schema for creating a portfolio item."""
    title = fields.Str(required=True, validate=validate.Length(min=3, max=200))
    description = fields.Str(validate=validate.Length(max=1000), allow_none=True)
    location = fields.Str(validate=validate.Length(max=200), allow_none=True)
    image_url = fields.Str(validate=validate.Length(max=500), allow_none=True)


# ==================== Admin Schemas ====================

class AdminEngineerActionSchema(Schema):
    """Schema for admin engineer approval/rejection."""
    reason = fields.Str(validate=validate.Length(max=500), allow_none=True)


class CreateAdminSchema(Schema):
    """Schema for creating a new admin."""
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True, validate=validate_password)
    phone = fields.Str(validate=validate_phone, allow_none=True)


class AdminUserActionSchema(Schema):
    """Schema for admin user block/unblock actions."""
    reason = fields.Str(validate=validate.Length(max=500), allow_none=True)


# ==================== Service Schemas ====================

class ServiceSchema(Schema):
    """Schema for service output."""
    id = fields.Str()
    feature_id = fields.Str()
    name = fields.Str()
    description = fields.Str()
    base_price = fields.Int()
    active = fields.Bool()


class FeatureSchema(Schema):
    """Schema for feature output."""
    id = fields.Str()
    name = fields.Str()
    icon = fields.Str()
    description = fields.Str()
    services = fields.Nested(ServiceSchema, many=True)


# ==================== Pagination Schema ====================

class PaginationSchema(Schema):
    """Schema for pagination parameters."""
    page = fields.Int(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Int(load_default=20, validate=validate.Range(min=1, max=100))


class PaginatedResponseSchema(Schema):
    """Base schema for paginated responses."""
    page = fields.Int()
    per_page = fields.Int()
    total = fields.Int()
    pages = fields.Int()
    has_next = fields.Bool()
    has_prev = fields.Bool()


# ==================== User Output Schemas ====================

class UserOutputSchema(Schema):
    """Schema for user output (safe, no password)."""
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()
    phone = fields.Str()
    role = fields.Str()
    status = fields.Str()
    city = fields.Str()
    area = fields.Str()
    created_at = fields.DateTime()


class EngineerProfileOutputSchema(Schema):
    """Schema for engineer profile output."""
    id = fields.Int()
    user_id = fields.Int()
    specialization = fields.Str()
    years_exp = fields.Int()
    bio = fields.Str()
    subscription_status = fields.Str()
    subscription_expiry = fields.Date()
    avg_rating = fields.Float()
    jobs_completed = fields.Int()
    photo_url = fields.Str()
    cv_url = fields.Str()
    certificate_url = fields.Str()


# ==================== Transaction Schemas ====================

class TransactionOutputSchema(Schema):
    """Schema for transaction output."""
    id = fields.Int()
    request_id = fields.Int()
    gross_amount = fields.Int()
    commission_amount = fields.Int()
    net_amount = fields.Int()
    created_at = fields.DateTime()


# ==================== Notification Schemas ====================

class NotificationOutputSchema(Schema):
    """Schema for notification output."""
    id = fields.Int()
    user_id = fields.Int()
    type = fields.Str()
    title = fields.Str()
    message = fields.Str()
    read = fields.Bool()
    created_at = fields.DateTime()


# ==================== Helper Function ====================

def validate_request_data(schema_class, data):
    """
    Validate request data against a schema.
    Returns (validated_data, None) on success or (None, errors) on failure.
    """
    schema = schema_class()
    try:
        validated = schema.load(data)
        return validated, None
    except ValidationError as err:
        return None, err.messages
