"""
FalcoElectrec Flask Application Factory
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS

from .extensions import db, jwt, migrate, limiter
from .config import Config


def create_app(config_class=Config):
    """Application factory for creating Flask app instances."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    
    # Initialize rate limiter (skip in testing)
    if not app.config.get('TESTING'):
        limiter.init_app(app)
    
    # Configure CORS
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    CORS(app, origins=cors_origins, supports_credentials=True)
    
    # Configure security headers (skip in testing)
    if not app.config.get('TESTING'):
        try:
            from .utils.security import configure_security_headers
            configure_security_headers(app)
        except ImportError:
            app.logger.warning("Security module not found, skipping security headers")
    
    # Initialize Swagger (only in non-testing mode)
    if not app.config.get('TESTING'):
        try:
            from flasgger import Swagger
            from .swagger_config import SWAGGER_TEMPLATE, SWAGGER_CONFIG
            Swagger(app, template=SWAGGER_TEMPLATE, config=SWAGGER_CONFIG)
        except ImportError:
            app.logger.warning("Flasgger not installed, Swagger UI disabled")

    # Register blueprints with versioned API prefix
    from .api import auth, services, requests, reviews, blocks, notifications, finance, engineer, uploads, admin, recommendations, disputes
    
    # API v1 routes
    app.register_blueprint(auth.bp, url_prefix='/api/v1/auth')
    app.register_blueprint(services.bp, url_prefix='/api/v1/services')
    app.register_blueprint(requests.bp, url_prefix='/api/v1/requests')
    app.register_blueprint(reviews.bp, url_prefix='/api/v1/reviews')
    app.register_blueprint(blocks.bp, url_prefix='/api/v1/blocks')
    app.register_blueprint(notifications.bp, url_prefix='/api/v1/notifications')
    app.register_blueprint(finance.bp, url_prefix='/api/v1/finance')
    app.register_blueprint(engineer.bp, url_prefix='/api/v1/engineer')
    app.register_blueprint(uploads.bp, url_prefix='/api/v1/uploads')
    app.register_blueprint(admin.bp, url_prefix='/api/v1/admin')
    app.register_blueprint(recommendations.bp, url_prefix='/api/v1/recommendations')
    app.register_blueprint(disputes.bp, url_prefix='/api/v1/disputes')
    
    # Legacy routes (for backward compatibility - will be deprecated)
    app.register_blueprint(auth.bp, url_prefix='/api/auth', name='auth_legacy')
    app.register_blueprint(services.bp, url_prefix='/api/services', name='services_legacy')
    app.register_blueprint(requests.bp, url_prefix='/api/requests', name='requests_legacy')
    app.register_blueprint(reviews.bp, url_prefix='/api/reviews', name='reviews_legacy')
    app.register_blueprint(blocks.bp, url_prefix='/api/blocks', name='blocks_legacy')
    app.register_blueprint(notifications.bp, url_prefix='/api/notifications', name='notifications_legacy')
    app.register_blueprint(finance.bp, url_prefix='/api/finance', name='finance_legacy')
    app.register_blueprint(engineer.bp, url_prefix='/api/engineer', name='engineer_legacy')
    app.register_blueprint(uploads.bp, url_prefix='/api/uploads', name='uploads_legacy')
    app.register_blueprint(admin.bp, url_prefix='/api/admin', name='admin_legacy')
    app.register_blueprint(recommendations.bp, url_prefix='/api/recommendations', name='recommendations_legacy')
    app.register_blueprint(disputes.bp, url_prefix='/api/disputes', name='disputes_legacy')
    
    # Global error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request', 'message': str(error.description)}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden', 'message': 'Access denied'}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found', 'message': str(error.description)}), 404
    
    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({'error': 'Validation error', 'message': str(error.description)}), 422
    
    @app.errorhandler(429)
    def ratelimit_handler(error):
        return jsonify({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.',
            'code': 'rate_limit_exceeded'
        }), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'ok', 'message': 'FalcoElectrec API is running'}

    @app.route('/api')
    def api_info():
        return {
            'name': 'FalcoElectrec API',
            'version': '1.0.0',
            'description': 'Multi-role Electrical Services Platform',
            'docs': '/docs' if not app.config.get('TESTING') else None,
            'endpoints': {
                'auth': '/api/auth',
                'services': '/api/services',
                'requests': '/api/requests',
                'reviews': '/api/reviews',
                'blocks': '/api/blocks',
                'notifications': '/api/notifications',
                'finance': '/api/finance',
                'engineer': '/api/engineer',
                'uploads': '/api/uploads',
                'admin': '/api/admin'
            }
        }

    # Create upload folder if it doesn't exist
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    # Initialize CLI commands
    from .cli import init_cli
    init_cli(app)

    return app
