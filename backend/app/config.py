"""
Flask Configuration for FalcoElectrec
"""
import os
import secrets
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

_ROOT_ENV = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(dotenv_path=_ROOT_ENV, override=os.getenv('FLASK_ENV') != 'production')


def _env_bool(name, default=False):
    """Read a boolean environment variable."""
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def _csv_env(name):
    """Read a comma-separated environment variable into a clean list."""
    return [item.strip() for item in os.getenv(name, '').split(',') if item.strip()]


def _secret_env(name):
    """Require configured secrets in production; generate ephemeral ones for local dev."""
    value = os.getenv(name)
    if value:
        return value
    if os.getenv('FLASK_ENV') == 'production':
        raise RuntimeError(f'{name} must be set in production')
    return secrets.token_urlsafe(48)


def _database_url():
    """Require explicit database configuration in production."""
    value = os.getenv('DATABASE_URL')
    if value:
        return value
    if os.getenv('FLASK_ENV') == 'production':
        raise RuntimeError('DATABASE_URL must be set in production')
    return 'mysql+pymysql://falco:falco_secret@localhost:3306/Graduation'


class Config:
    """Base configuration."""
    
    # Flask
    SECRET_KEY = _secret_env('SECRET_KEY')
    
    # Database
    SQLALCHEMY_DATABASE_URI = _database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv('FLASK_ENV') == 'development'
    
    # JWT
    JWT_SECRET_KEY = _secret_env('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # File uploads
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
    
    # DEMO MODE: Passwordless Admin Access via Email Whitelist
    # THIS FEATURE IS FOR DEMO/GRADUATION PURPOSES ONLY
    ADMIN_EMAIL_WHITELIST = _csv_env('ADMIN_EMAIL_WHITELIST')
    DEMO_MODE = _env_bool('DEMO_MODE', False)
    ALLOW_PENDING_ENGINEER_LOGIN = _env_bool('ALLOW_PENDING_ENGINEER_LOGIN', True)
    
    # Demo accounts are intentionally not hardcoded. Seed demo users through
    # seed_demo.py or the database, and enable DEMO_MODE only for local demos.
    DEMO_ACCOUNTS = {}


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'sqlite:///:memory:')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=5)
    DEMO_MODE = False
    ALLOW_PENDING_ENGINEER_LOGIN = False
    ADMIN_EMAIL_WHITELIST = []


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
