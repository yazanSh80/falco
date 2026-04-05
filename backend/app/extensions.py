"""
Flask Extensions for FalcoElectrec
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize extensions without app
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)


# JWT callbacks
@jwt.user_identity_loader
def user_identity_lookup(user):
    """Callback to convert user object to JSON-serializable identity.
    PyJWT requires 'sub' claim to be a string per RFC 7519."""
    user_id = user.id if hasattr(user, 'id') else user
    return str(user_id)  # Convert to string for RFC compliance


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Callback to load user from database based on JWT identity."""
    from .models.user import User
    from flask import current_app
    identity = jwt_data.get("sub")
    current_app.logger.info(f"[JWT] User lookup: identity={identity}, type={type(identity)}")
    # Convert string identity back to int for database lookup
    try:
        user_id = int(identity) if isinstance(identity, str) else identity
        user = User.query.get(user_id)
        if user:
            current_app.logger.info(f"[JWT] User found: {user.email}")
        else:
            current_app.logger.warning(f"[JWT] User NOT found with ID {user_id}")
        return user
    except (ValueError, TypeError) as e:
        current_app.logger.error(f"[JWT] Error converting identity: {e}")
        return None


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    """Callback when token has expired."""
    return {'error': 'Token has expired', 'code': 'token_expired'}, 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    """Callback when token is invalid."""
    from flask import current_app
    current_app.logger.error(f"[JWT] Invalid token error: {error}")
    return {'error': 'Invalid token', 'code': 'invalid_token', 'debug': str(error)}, 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    """Callback when token is missing."""
    return {'error': 'Authorization token is required', 'code': 'missing_token'}, 401
