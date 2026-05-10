"""
Security Headers Configuration for Flask
Using Flask-Talisman for production-ready security headers
"""
from flask import Flask


def configure_security_headers(app: Flask) -> None:
    """
    Configure security headers for the Flask application.
    
    This should be called after app initialization but before running.
    """
    try:
        from flask_talisman import Talisman
        
        # Content Security Policy
        csp = {
            'default-src': "'self'",
            'script-src': [
                "'self'",
                "'unsafe-inline'",  # Required for some React functionality
                "'unsafe-eval'",    # Required for development (remove in production)
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'",  # Required for Tailwind CSS
            ],
            'img-src': [
                "'self'",
                "data:",
                "blob:",
                "https:",
            ],
            'font-src': [
                "'self'",
                "https://fonts.gstatic.com",
            ],
            'connect-src': [
                "'self'",
                "http://localhost:*",
                "ws://localhost:*",
            ],
            'frame-ancestors': "'none'",
            'form-action': "'self'",
        }
        
        # Initialize Talisman with security settings
        Talisman(
            app,
            # Force HTTPS (disable in development)
            force_https=not app.debug,
            
            # HTTP Strict Transport Security
            strict_transport_security=True,
            strict_transport_security_max_age=31536000,  # 1 year
            strict_transport_security_include_subdomains=True,
            strict_transport_security_preload=True,
            
            # Content Security Policy
            content_security_policy=csp if not app.debug else None,
            content_security_policy_nonce_in=['script-src'],
            
            # Referrer Policy
            referrer_policy='strict-origin-when-cross-origin',
            
            # Feature Policy
            feature_policy={
                'geolocation': "'none'",
                'microphone': "'none'",
                'camera': "'none'",
            },
            
            # X-Frame-Options
            frame_options='DENY',
            
            # X-Content-Type-Options
            x_content_type_options=True,
            
            # X-XSS-Protection
            x_xss_protection=True,
            
            # Session cookie security
            session_cookie_secure=not app.debug,
            session_cookie_http_only=True,
        )
        
        app.logger.info("Security headers configured with Flask-Talisman")
        
    except ImportError:
        app.logger.warning(
            "Flask-Talisman not installed. "
            "Install it with: pip install flask-talisman"
        )
        
        # Fallback: Add basic security headers manually
        @app.after_request
        def add_security_headers(response):
            # Prevent clickjacking
            response.headers['X-Frame-Options'] = 'DENY'
            
            # Prevent MIME type sniffing
            response.headers['X-Content-Type-Options'] = 'nosniff'
            
            # Enable XSS filter
            response.headers['X-XSS-Protection'] = '1; mode=block'
            
            # Referrer policy
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            
            # Permissions policy
            response.headers['Permissions-Policy'] = (
                'geolocation=(), microphone=(), camera=()'
            )
            
            return response
        
        app.logger.info("Basic security headers configured (manual fallback)")


def configure_cors_security(app: Flask) -> None:
    """
    Configure secure CORS settings.
    
    Call this after CORS is initialized to apply additional security.
    """
    @app.after_request
    def cors_security(response):
        # Ensure credentials are only sent with allowed origins
        origin = response.headers.get('Access-Control-Allow-Origin')
        if origin and origin != '*':
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        
        return response
