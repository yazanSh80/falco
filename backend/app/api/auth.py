"""
Authentication API for FalcoElectrec
"""
import os
from datetime import date, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, current_user, get_jwt_identity
)
from marshmallow import ValidationError

from ..extensions import db, limiter
from ..models.user import User, UserRole, UserStatus
from ..models.engineer_profile import EngineerProfile, SubscriptionStatus
from ..models.engineer_approval_request import EngineerApprovalRequest, ApprovalStatus
from ..schemas import RegisterSchema, LoginSchema, UpdateProfileSchema

bp = Blueprint('auth', __name__)

# Schema instances
register_schema = RegisterSchema()
login_schema = LoginSchema()
update_profile_schema = UpdateProfileSchema()


@bp.route('/register', methods=['POST'])
def register():
    """Register a new user (customer or engineer).
    
    Role MUST be provided in the request - this is the source of truth.
    """
    try:
        data = request.get_json()
        
        # DEBUG LOG (temporary)
        current_app.logger.info(f"[REGISTER] Received data: {data}")
        
        # Validate with marshmallow schema
        try:
            validated_data = register_schema.load(data)
        except ValidationError as err:
            current_app.logger.warning(f"[REGISTER] Validation failed: {err.messages}")
            # Format validation errors into user-friendly message
            error_messages = []
            for field, messages in err.messages.items():
                if isinstance(messages, list):
                    error_messages.extend([f"{field}: {msg}" for msg in messages])
                else:
                    error_messages.append(f"{field}: {messages}")
            friendly_message = error_messages[0] if error_messages else 'Validation failed'
            return jsonify({
                'error': 'VALIDATION_ERROR',
                'message': friendly_message,
                'details': err.messages
            }), 400
        
        # Role is REQUIRED - this is the source of truth
        role = validated_data.get('role', '').lower()
        if role not in ['customer', 'engineer']:
            return jsonify({'error': 'Role is required. Must be "customer" or "engineer"'}), 400
        
        email = validated_data['email'].lower()
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            current_app.logger.warning(f"[REGISTER] Email already exists: {email}")
            return jsonify({
                'error': 'This email is already registered',
                'code': 'EMAIL_EXISTS',
                'message': 'This email is already registered',
                'fields': {'email': 'This email is already in use'}
            }), 409
        
        # DEBUG LOG (temporary)
        current_app.logger.info(f"[REGISTER] Creating user: email={email}, role={role}")
        
        # Create user with role-based status
        # Customer -> status=active, Engineer -> status=pending
        user = User(
            name=validated_data['name'],
            email=email,
            phone=validated_data.get('phone'),
            role=role,
            city=validated_data.get('city'),
            area=validated_data.get('area'),
            status=UserStatus.ACTIVE.value if role == UserRole.CUSTOMER.value else UserStatus.PENDING.value
        )
        user.set_password(validated_data['password'])
        
        db.session.add(user)
        db.session.flush()  # Get user ID
        
        current_app.logger.info(f"[REGISTER] Flushed user: id={user.id}, email={email}")
        
        # If engineer, create profile and approval request
        if role == UserRole.ENGINEER.value:
            # Specialization will default to empty string if not provided
            # Engineers can update it after approval
            specialization = validated_data.get('specialization', '')
            
            # If no specialization provided, use a placeholder
            if not specialization:
                specialization = 'Not specified'
            
            profile = EngineerProfile(
                user_id=user.id,
                specialization=specialization,
                years_exp=validated_data.get('years_exp', 0),
                bio=validated_data.get('bio', ''),
                subscription_status=SubscriptionStatus.ACTIVE.value,
                subscription_expiry=date.today() + timedelta(days=30)  # 30-day trial
            )
            db.session.add(profile)
            current_app.logger.info(f"[REGISTER] Added engineer profile for user {user.id}")
            
            # Create approval request visible to all admins
            approval_request = EngineerApprovalRequest(
                user_id=user.id,
                name=user.name,
                email=user.email,
                phone=user.phone,
                city=user.city,
                area=user.area,
                specialization=specialization,
                years_exp=validated_data.get('years_exp', 0),
                bio=validated_data.get('bio', ''),
                status=ApprovalStatus.PENDING.value
            )
            db.session.add(approval_request)
            current_app.logger.info(f"[REGISTER] Added approval request for user {user.id}")
        
        # Commit all changes
        db.session.commit()
        current_app.logger.info(f"[REGISTER] Committed user to database: id={user.id}, email={email}")
        
        # Build user response with verification_status
        user_data = user.to_dict(include_profile=True)
        
        # Add verification_status based on user status (for engineers)
        if role == UserRole.ENGINEER.value:
            user_data['verification_status'] = 'pending'  # Always pending for new engineers
        else:
            user_data['verification_status'] = None
        
        # DEBUG LOG (temporary)
        current_app.logger.info(f"[REGISTER] User created: id={user.id}, role={user.role}, status={user.status}")
        
        # Build response
        response = {
            'message': 'Registration successful',
            'user': user_data
        }
        
        if role == UserRole.CUSTOMER.value:
            access_token = create_access_token(identity=user)
            response['access_token'] = access_token
            response['message'] = 'Registration successful. You can now login.'
        else:
            # Engineers also get token so they can login and upload CV/certificate while pending
            access_token = create_access_token(identity=user)
            response['access_token'] = access_token
            response['message'] = 'Registration successful. Your account is pending admin approval. You can login now to upload your CV and certificate.'
        
        current_app.logger.info(f"[REGISTER] Registration complete for {email}")
        return jsonify(response), 201
    
    except Exception as e:
        current_app.logger.error(f"[REGISTER] Unexpected error: {str(e)}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'error': 'REGISTRATION_ERROR',
            'message': 'An unexpected error occurred during registration',
            'details': str(e)
        }), 500


# Register login route
@bp.route('/login', methods=['POST'])
def login():
    """Authenticate user with database credentials and return JWT token.
    
    Returns user with role, status, and verification_status for proper frontend routing.
    Engineers are allowed to login even with pending status to see their pending page.
    """
    data = request.get_json()
    
    # Validate with marshmallow schema
    try:
        validated_data = login_schema.load(data)
    except ValidationError as err:
        return jsonify({
            'error': 'VALIDATION_ERROR',
            'message': 'Invalid login credentials format',
            'fields': err.messages
        }), 400
    
    email = validated_data['email'].lower()
    password = validated_data['password']
    
    # Query database for user
    user = User.query.filter_by(email=email).first()
    
    if not user:
        current_app.logger.warning(f"[LOGIN] User not found: {email}")
        return jsonify({
            'error': 'INVALID_CREDENTIALS',
            'message': 'Invalid email or password'
        }), 401
    
    # Verify password
    if not user.check_password(password):
        current_app.logger.warning(f"[LOGIN] Invalid password for user: {email}")
        return jsonify({
            'error': 'INVALID_CREDENTIALS',
            'message': 'Invalid email or password'
        }), 401
    
    current_app.logger.info(f"[LOGIN] Password verified for user: {user.email}, Role: {user.role}, Status: {user.status}")
    
    # Check status - blocked users cannot login
    if user.status == UserStatus.BLOCKED.value:
        current_app.logger.warning(f"[LOGIN] Blocked user attempted login: {email}")
        return jsonify({
            'error': 'ACCOUNT_BLOCKED',
            'message': 'Your account has been blocked. Contact support.'
        }), 403
    
    # For non-engineers, pending status means they cannot login
    if user.status == UserStatus.PENDING.value and user.role != UserRole.ENGINEER.value:
        current_app.logger.warning(f"[LOGIN] Pending non-engineer user attempted login: {email}")
        return jsonify({
            'error': 'ACCOUNT_PENDING',
            'message': 'Your account is pending approval.',
            'code': 'pending_approval'
        }), 403

    if (
        user.status == UserStatus.PENDING.value
        and user.role == UserRole.ENGINEER.value
        and not current_app.config.get('ALLOW_PENDING_ENGINEER_LOGIN', True)
    ):
        current_app.logger.warning(f"[LOGIN] Pending engineer blocked by config: {email}")
        return jsonify({
            'error': 'ACCOUNT_PENDING',
            'message': 'Your engineer account is pending admin approval.',
            'code': 'pending_approval'
        }), 403
    
    # Generate tokens
    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)
    
    current_app.logger.info(f"[LOGIN] Tokens generated for user: {user.email}")
    
    # Build user response with verification_status for engineers
    user_data = user.to_dict(include_profile=True)
    
    # Add verification_status based on user status (for engineers)
    if user.role == UserRole.ENGINEER.value:
        if user.status == UserStatus.ACTIVE.value:
            user_data['verification_status'] = 'approved'
        elif user.status == UserStatus.PENDING.value:
            user_data['verification_status'] = 'pending'
        else:
            user_data['verification_status'] = None
    else:
        user_data['verification_status'] = None
    
    current_app.logger.info(f"[LOGIN] Successful login for user: {email}, role: {user.role}")
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_data
    }), 200


@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should discard token)."""
    # In a more complete implementation, we could blacklist the token
    return jsonify({'message': 'Successfully logged out'}), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user info.
    
    Returns user with verification_status for proper frontend routing.
    """
    user_data = current_user.to_dict(include_profile=True)
    
    # Add verification_status based on user status (for engineers)
    if current_user.role == UserRole.ENGINEER.value:
        if current_user.status == UserStatus.ACTIVE.value:
            user_data['verification_status'] = 'approved'
        elif current_user.status == UserStatus.PENDING.value:
            user_data['verification_status'] = 'pending'
        else:
            user_data['verification_status'] = None
    else:
        user_data['verification_status'] = None
    
    return jsonify({
        'user': user_data
    }), 200


@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    """Update current user profile."""
    data = request.get_json()
    
    # Validate with marshmallow schema (partial=True allows optional fields)
    try:
        validated_data = update_profile_schema.load(data, partial=True)
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    
    user = current_user
    
    # Allowed fields to update
    if 'name' in validated_data:
        user.name = validated_data['name']
    if 'phone' in validated_data:
        user.phone = validated_data['phone']
    if 'city' in validated_data:
        user.city = validated_data['city']
    if 'area' in validated_data:
        user.area = validated_data['area']
    
    # Password change (handled separately, not in schema)
    if 'password' in data and 'current_password' in data:
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400
        if len(data['password']) < 8:
            return jsonify({'error': 'New password must be at least 8 characters'}), 400
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(include_profile=True)
    }), 200


@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token."""
    identity = get_jwt_identity()
    user = User.query.get(identity)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    access_token = create_access_token(identity=user)
    
    return jsonify({
        'access_token': access_token
    }), 200


@bp.route('/admin-login', methods=['POST'])
def admin_login():
    """
    DEMO MODE: Passwordless Admin Login via Email Whitelist
    
    THIS ENDPOINT IS FOR DEMO/GRADUATION PURPOSES ONLY.
    It allows admin access to whitelisted emails WITHOUT password verification.
    
    Payload:
    {
      "email": "ahmadsaqer818@gmail.com"
    }
    
    Returns:
    {
      "access_token": "...",
      "user": {
        "id": 1,
        "email": "...",
        "name": "...",
        "role": "admin",
        "status": "active",
        ...
      }
    }
    """
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({
            'error': 'VALIDATION_ERROR',
            'message': 'Email is required'
        }), 400
    
    # Check if demo mode is enabled
    if not current_app.config.get('DEMO_MODE', False):
        return jsonify({
            'error': 'DEMO_MODE_DISABLED',
            'message': 'Admin passwordless login is not available in production'
        }), 403
    
    email = data.get('email', '').lower().strip()
    admin_whitelist = current_app.config.get('ADMIN_EMAIL_WHITELIST', [])
    
    # Check if email is in admin whitelist
    if email not in admin_whitelist:
        current_app.logger.warning(f"[ADMIN-LOGIN] Unauthorized email: {email}")
        return jsonify({
            'error': 'FORBIDDEN',
            'message': 'Email not authorized for admin access'
        }), 403
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    # If user doesn't exist, create admin user
    if not user:
        current_app.logger.info(f"[ADMIN-LOGIN] Creating new admin user: {email}")
        user = User(
            email=email,
            name=email.split('@')[0].replace('.', ' ').title(),  # Extract name from email
            role=UserRole.ADMIN.value,
            status=UserStatus.ACTIVE.value
        )
        # Set a random password (passwordless login, but password field is required in DB)
        user.set_password(os.urandom(24).hex())  # Random token as password
        db.session.add(user)
        db.session.commit()
        current_app.logger.info(f"[ADMIN-LOGIN] Admin user created: id={user.id}")
    else:
        # If user exists but is not admin, don't grant access
        if user.role != UserRole.ADMIN.value:
            current_app.logger.warning(f"[ADMIN-LOGIN] User exists but is not admin: {email}, role={user.role}")
            return jsonify({
                'error': 'FORBIDDEN',
                'message': 'User exists but does not have admin role'
            }), 403
        
        # Check if admin is blocked
        if user.status == UserStatus.BLOCKED.value:
            return jsonify({
                'error': 'ACCOUNT_BLOCKED',
                'message': 'Admin account has been blocked'
            }), 403
    
    # Generate JWT token
    access_token = create_access_token(identity=user)
    refresh_token = create_refresh_token(identity=user)
    
    user_data = user.to_dict(include_profile=True)
    
    current_app.logger.info(f"[ADMIN-LOGIN] Admin login successful: {email}, role={user.role}")
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_data,
        'message': 'Admin login successful (Demo Mode)'
    }), 200
