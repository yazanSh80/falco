"""
Test Configuration for FalcoElectrec Backend
"""
import pytest
from app import create_app
from app.config import TestingConfig
from app.extensions import db
from app import models as _models  # noqa: F401 - ensure all tables are registered
from app.models.user import User, UserRole, UserStatus
from app.models.engineer_profile import EngineerProfile, SubscriptionStatus
from app.models.service import Feature, Service
from datetime import date, timedelta


# Strong password for tests (meets requirements: 8+ chars, uppercase, lowercase, digit)
TEST_PASSWORD = 'TestPass123'


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app(TestingConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def customer_user(app):
    """Create a customer user for testing."""
    user = User(
        name='Test Customer',
        email='customer@test.com',
        phone='0599111111',
        role=UserRole.CUSTOMER.value,
        status=UserStatus.ACTIVE.value,
        city='Hebron',
        area='City Center'
    )
    user.set_password(TEST_PASSWORD)
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def engineer_user(app):
    """Create an engineer user with active subscription."""
    user = User(
        name='Test Engineer',
        email='engineer@test.com',
        phone='0599222222',
        role=UserRole.ENGINEER.value,
        status=UserStatus.ACTIVE.value,
        city='Hebron',
        area='City Center'
    )
    user.set_password(TEST_PASSWORD)
    db.session.add(user)
    db.session.flush()
    
    profile = EngineerProfile(
        user_id=user.id,
        specialization='Electricity',
        years_exp=5,
        bio='Test engineer',
        subscription_status=SubscriptionStatus.ACTIVE.value,
        subscription_expiry=date.today() + timedelta(days=30)
    )
    db.session.add(profile)
    db.session.commit()
    return user


@pytest.fixture
def admin_user(app):
    """Create an admin user for testing."""
    user = User(
        name='Test Admin',
        email='admin@test.com',
        phone='0599333333',
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value,
        city='Hebron',
        area='City Center'
    )
    user.set_password(TEST_PASSWORD)
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def sample_services(app):
    """Create sample features and services."""
    feature = Feature(
        id='F1',
        name='Electricity',
        icon='Zap',
        description='Electrical services'
    )
    db.session.add(feature)
    
    service = Service(
        id='S1',
        feature_id='F1',
        name='Lighting Repair',
        description='Fix lighting issues',
        base_price=120
    )
    db.session.add(service)
    db.session.commit()
    
    return {'feature': feature, 'service': service}


def get_auth_headers(client, email, password):
    """Helper to get authentication headers."""
    response = client.post('/api/auth/login', json={
        'email': email,
        'password': password
    })
    token = response.get_json().get('access_token')
    return {'Authorization': f'Bearer {token}'}
