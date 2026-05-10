"""
Utility Decorators for FalcoElectrec API
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, current_user

from ..models.user import User, UserRole, UserStatus


def require_role(*roles):
    """Decorator to require specific role(s) for an endpoint.
    
    Usage:
        @require_role('admin')
        @require_role('admin', 'engineer')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = current_user
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.status == UserStatus.BLOCKED.value:
                return jsonify({'error': 'Your account has been blocked'}), 403
            
            # Convert roles to list and check
            allowed_roles = [r.value if isinstance(r, UserRole) else r for r in roles]
            
            if user.role not in allowed_roles:
                return jsonify({
                    'error': f'Access denied. Required role: {", ".join(allowed_roles)}'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def require_active_subscription(fn):
    """Decorator to require an active subscription for engineers."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = current_user
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_engineer():
            return jsonify({'error': 'This action is only for engineers'}), 403
        
        if not user.engineer_profile:
            return jsonify({'error': 'Engineer profile not found'}), 404
        
        if not user.engineer_profile.is_subscription_active():
            return jsonify({
                'error': 'Your subscription has expired. Please renew to continue.',
                'code': 'subscription_expired'
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper


def require_approved_engineer(fn):
    """Decorator to require an approved engineer status."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user = current_user
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.is_engineer():
            return jsonify({'error': 'This action is only for engineers'}), 403
        
        if user.status != UserStatus.ACTIVE.value:
            return jsonify({
                'error': 'Your account is pending approval or has been blocked.',
                'code': 'account_not_active'
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper


def optional_jwt(fn):
    """Decorator for endpoints that work with or without authentication."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
        except Exception:
            pass
        return fn(*args, **kwargs)
    return wrapper
