"""
File Uploads API for FalcoElectrec
"""
import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, current_user
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models.engineer_certificate import EngineerCertificate

bp = Blueprint('uploads', __name__)


def allowed_file(filename):
    """Check if file extension is allowed."""
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def generate_unique_filename(filename):
    """Generate a unique filename while preserving extension."""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    unique_name = f"{uuid.uuid4().hex}"
    return f"{unique_name}.{ext}" if ext else unique_name


@bp.route('', methods=['POST'])
@jwt_required()
def upload_file():
    """Upload a file (CV, certificate, portfolio image, etc.).
    
    For engineers:
    - CV: Single file per engineer, stored in engineer_profile.cv_url
    - Certificate: Multiple files per engineer, stored in engineer_certificates table
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided', 'code': 'missing_file'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected', 'code': 'empty_file'}), 400
        
        if not allowed_file(file.filename):
            allowed_exts = current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'})
            return jsonify({
                'error': 'File type not allowed',
                'code': 'invalid_file_type',
                'allowed_extensions': list(allowed_exts)
            }), 400
        
        # Get file type (cv, certificate, portfolio, photo)
        file_type = request.form.get('type', 'general')
        
        if not file_type:
            return jsonify({'error': 'File type is required', 'code': 'missing_file_type'}), 400
        
        # Validate file type
        valid_types = ['cv', 'certificate', 'portfolio', 'photo', 'general']
        if file_type not in valid_types:
            return jsonify({
                'error': f'Invalid file type. Must be one of: {", ".join(valid_types)}',
                'code': 'invalid_file_type'
            }), 400
        
        # Create subdirectory based on type
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        type_folder = os.path.join(upload_folder, file_type)
        
        try:
            os.makedirs(type_folder, exist_ok=True)
        except Exception as e:
            current_app.logger.error(f"[UPLOAD] Failed to create upload folder: {str(e)}")
            return jsonify({'error': 'Failed to create upload folder', 'code': 'folder_error'}), 500
        
        # Generate unique filename
        original_filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(original_filename)
        
        # Save file
        file_path = os.path.join(type_folder, unique_filename)
        
        try:
            file.save(file_path)
            current_app.logger.info(f"[UPLOAD] File saved: {file_path}")
        except Exception as e:
            current_app.logger.error(f"[UPLOAD] Failed to save file: {str(e)}")
            return jsonify({'error': 'Failed to save file', 'code': 'save_error'}), 500
        
        # Generate URL (relative path for API)
        file_url = f"/api/uploads/{file_type}/{unique_filename}"
        
        # If this is a CV or certificate for engineer, update profile
        if file_type in ['cv', 'certificate'] and current_user.is_engineer():
            try:
                profile = current_user.engineer_profile
                
                if not profile:
                    # Clean up saved file on error
                    try:
                        os.remove(file_path)
                    except:
                        pass
                    return jsonify({'error': 'Engineer profile not found', 'code': 'profile_not_found'}), 404
                
                if file_type == 'cv':
                    # For CV, store single URL in profile
                    old_cv = profile.cv_url
                    profile.cv_url = file_url
                    
                    # Try to delete old CV file if it exists
                    if old_cv:
                        try:
                            old_filename = old_cv.split('/')[-1]
                            old_path = os.path.join(upload_folder, 'cv', old_filename)
                            if os.path.exists(old_path):
                                os.remove(old_path)
                                current_app.logger.info(f"[UPLOAD] Deleted old CV: {old_path}")
                        except Exception as e:
                            current_app.logger.warning(f"[UPLOAD] Could not delete old CV: {str(e)}")
                    
                    db.session.commit()
                    current_app.logger.info(f"[UPLOAD] Updated engineer CV for user {current_user.id}")
                
                elif file_type == 'certificate':
                    # For certificates, store in separate table (allow multiple)
                    certificate = EngineerCertificate(
                        user_id=current_user.id,
                        certificate_url=file_url,
                        certificate_name=original_filename
                    )
                    db.session.add(certificate)
                    db.session.commit()
                    current_app.logger.info(f"[UPLOAD] Added certificate for user {current_user.id}: {certificate.id}")
            
            except Exception as e:
                # Clean up saved file on error
                try:
                    os.remove(file_path)
                except:
                    pass
                current_app.logger.error(f"[UPLOAD] Failed to update engineer profile: {str(e)}")
                db.session.rollback()
                return jsonify({
                    'error': 'Failed to save file information to database',
                    'code': 'db_error',
                    'details': str(e)
                }), 500
        
        return jsonify({
            'message': 'File uploaded successfully',
            'url': file_url,
            'filename': unique_filename,
            'original_filename': original_filename,
            'type': file_type
        }), 201
    
    except Exception as e:
        current_app.logger.error(f"[UPLOAD] Unexpected error: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred during upload',
            'code': 'unexpected_error',
            'details': str(e)
        }), 500


@bp.route('/<file_type>/<filename>', methods=['GET'])
def get_file(file_type, filename):
    """Serve an uploaded file."""
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    type_folder = os.path.join(upload_folder, file_type)
    
    return send_from_directory(type_folder, filename)


@bp.route('/<file_type>/<filename>', methods=['DELETE'])
@jwt_required()
def delete_file(file_type, filename):
    """Delete an uploaded file."""
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    file_path = os.path.join(upload_folder, file_type, filename)
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    
    # Permission check - only owner or admin can delete
    # Admin users can delete any file
    if current_user.role != 'admin':
        # For non-admins, check if they own the file
        # File ownership is determined by checking if the filename contains user ID
        # or if it's in their associated records (portfolio, profile, etc.)
        user_id_str = str(current_user.id)
        
        # Check if user owns this file based on file type
        if file_type == 'portfolio':
            # Check if this file belongs to user's portfolio
            from ..models.portfolio import Portfolio
            portfolio_item = Portfolio.query.filter_by(
                engineer_id=current_user.id
            ).filter(
                Portfolio.image_url.contains(filename)
            ).first()
            if not portfolio_item:
                return jsonify({'error': 'Unauthorized - you can only delete your own files'}), 403
        elif file_type == 'cv' or file_type == 'certificate':
            # Check if this file belongs to user's engineer profile
            from ..models.engineer_profile import EngineerProfile
            profile = EngineerProfile.query.filter_by(user_id=current_user.id).first()
            if not profile:
                return jsonify({'error': 'Unauthorized - you can only delete your own files'}), 403
            # Check if the file is in user's profile
            if file_type == 'cv' and profile.cv_url and filename not in profile.cv_url:
                return jsonify({'error': 'Unauthorized - you can only delete your own files'}), 403
            if file_type == 'certificate' and profile.certificate_url and filename not in profile.certificate_url:
                return jsonify({'error': 'Unauthorized - you can only delete your own files'}), 403
        elif file_type == 'photo':
            # Request photos - check if user created the request
            from ..models.request import Request
            req = Request.query.filter_by(customer_id=current_user.id).filter(
                Request.images.contains(filename)
            ).first()
            if not req:
                return jsonify({'error': 'Unauthorized - you can only delete your own files'}), 403
    
    os.remove(file_path)
    
    return jsonify({
        'message': 'File deleted successfully'
    }), 200


@bp.route('/types', methods=['GET'])
def get_upload_types():
    """Get information about allowed upload types."""
    return jsonify({
        'types': {
            'cv': {
                'description': 'Engineer CV/Resume',
                'allowed_extensions': ['pdf', 'doc', 'docx'],
                'max_size_mb': 5
            },
            'certificate': {
                'description': 'Professional certificates',
                'allowed_extensions': ['pdf', 'png', 'jpg', 'jpeg'],
                'max_size_mb': 5
            },
            'portfolio': {
                'description': 'Portfolio images',
                'allowed_extensions': ['png', 'jpg', 'jpeg', 'gif'],
                'max_size_mb': 10
            },
            'photo': {
                'description': 'Request photos',
                'allowed_extensions': ['png', 'jpg', 'jpeg', 'gif'],
                'max_size_mb': 10
            }
        },
        'max_content_length_mb': current_app.config.get('MAX_CONTENT_LENGTH', 16777216) / (1024 * 1024)
    }), 200
