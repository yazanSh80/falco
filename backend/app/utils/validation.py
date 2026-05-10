"""
Validation Utilities for FalcoElectrec
Provides standardized validation and error responses.
"""
import re
from functools import wraps
from flask import jsonify, request


class ValidationError(Exception):
    """Custom validation error with structured error info."""
    
    def __init__(self, message, code='VALIDATION_ERROR', fields=None):
        self.message = message
        self.code = code
        self.fields = fields or {}
        super().__init__(self.message)
    
    def to_response(self, status_code=400):
        """Convert to JSON response tuple."""
        response = {
            'error': self.code,
            'message': self.message
        }
        if self.fields:
            response['fields'] = self.fields
        return jsonify(response), status_code


def validation_error_response(message, code='VALIDATION_ERROR', fields=None, status_code=400):
    """Create a standardized validation error response."""
    response = {
        'error': code,
        'message': message
    }
    if fields:
        response['fields'] = fields
    return jsonify(response), status_code


def not_found_error(resource_type='Resource', resource_id=None):
    """Create a standardized not found error response."""
    message = f'{resource_type} not found'
    if resource_id:
        message = f'{resource_type} with ID {resource_id} not found'
    return jsonify({
        'error': 'NOT_FOUND',
        'message': message
    }), 404


def conflict_error(message, code='CONFLICT'):
    """Create a standardized conflict error response."""
    return jsonify({
        'error': code,
        'message': message
    }), 409


def forbidden_error(message='Access denied', code='FORBIDDEN'):
    """Create a standardized forbidden error response."""
    return jsonify({
        'error': code,
        'message': message
    }), 403


def bad_request_error(message, code='BAD_REQUEST'):
    """Create a standardized bad request error response."""
    return jsonify({
        'error': code,
        'message': message
    }), 400


# ==================== Validation Functions ====================

def validate_email(email):
    """
    Validate email format.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not email:
        return False, 'Email is required'
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, 'Invalid email format'
    
    if len(email) > 255:
        return False, 'Email must be less than 255 characters'
    
    return True, None


def validate_password(password, min_length=8):
    """
    Validate password strength.
    
    Requirements:
    - Minimum length (default 8)
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not password:
        return False, 'Password is required'
    
    if len(password) < min_length:
        return False, f'Password must be at least {min_length} characters'
    
    if len(password) > 128:
        return False, 'Password must be less than 128 characters'
    
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one digit'
    
    return True, None


def validate_rating(rating):
    """
    Validate rating is within allowed range (1-5).
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if rating is None:
        return False, 'Rating is required'
    
    try:
        rating = int(rating)
    except (ValueError, TypeError):
        return False, 'Rating must be a number'
    
    if rating < 1 or rating > 5:
        return False, 'Rating must be between 1 and 5'
    
    return True, None


def validate_phone(phone):
    """
    Validate phone number format.
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not phone:
        return True, None  # Phone is optional
    
    # Remove common separators
    cleaned = re.sub(r'[\s\-\(\)\+]', '', phone)
    
    if not cleaned.isdigit():
        return False, 'Phone number can only contain digits and common separators'
    
    if len(cleaned) < 9 or len(cleaned) > 15:
        return False, 'Phone number must be between 9 and 15 digits'
    
    return True, None


# ==================== Status Transition Validation ====================

# Valid status transitions for requests
REQUEST_STATUS_TRANSITIONS = {
    'pending': ['accepted', 'cancelled'],
    'accepted': ['in_progress', 'cancelled'],
    'in_progress': ['completed', 'cancelled'],
    'completed': [],  # Final state
    'cancelled': []   # Final state
}

# Valid status transitions for disputes
DISPUTE_STATUS_TRANSITIONS = {
    'open': ['in_review', 'rejected', 'resolved'],
    'in_review': ['resolved', 'rejected'],
    'resolved': [],  # Final state
    'rejected': []   # Final state
}


def validate_status_transition(current_status, new_status, allowed_transitions):
    """
    Validate if a status transition is allowed.
    
    Args:
        current_status: Current status value
        new_status: Target status value
        allowed_transitions: Dict mapping current status to allowed next statuses
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if current_status not in allowed_transitions:
        return False, f'Unknown current status: {current_status}'
    
    if new_status not in allowed_transitions.get(current_status, []):
        allowed = allowed_transitions.get(current_status, [])
        if not allowed:
            return False, f'Cannot change status from {current_status} (final state)'
        return False, f'Cannot transition from {current_status} to {new_status}. Allowed: {", ".join(allowed)}'
    
    return True, None


def validate_request_status_transition(current_status, new_status):
    """Validate request status transition."""
    return validate_status_transition(current_status, new_status, REQUEST_STATUS_TRANSITIONS)


def validate_dispute_status_transition(current_status, new_status):
    """Validate dispute status transition."""
    return validate_status_transition(current_status, new_status, DISPUTE_STATUS_TRANSITIONS)


# ==================== Decorator for Request Validation ====================

def validate_json_request(required_fields=None, optional_fields=None):
    """
    Decorator to validate JSON request body.
    
    Args:
        required_fields: List of required field names
        optional_fields: List of optional field names (for documentation)
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            
            if data is None:
                return validation_error_response(
                    'Request body must be valid JSON',
                    code='INVALID_JSON'
                )
            
            if required_fields:
                missing = []
                for field in required_fields:
                    if field not in data or data[field] is None:
                        missing.append(field)
                
                if missing:
                    return validation_error_response(
                        f'Missing required fields: {", ".join(missing)}',
                        code='MISSING_FIELDS',
                        fields={field: 'This field is required' for field in missing}
                    )
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator
