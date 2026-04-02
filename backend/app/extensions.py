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
    """Callback to convert user object to JSON-serializable identity."""
    return user.id if hasattr(user, 'id') else user


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Callback to load user from database based on JWT identity."""
    from .models.user import User
    identity = jwt_data["sub"]
    return User.query.get(identity)


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    """Callback when token has expired."""
    return {'error': 'Token has expired', 'code': 'token_expired'}, 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    """Callback when token is invalid."""
    return {'error': 'Invalid token', 'code': 'invalid_token'}, 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    """Callback when token is missing."""
    return {'error': 'Authorization token is required', 'code': 'missing_token'}, 401
