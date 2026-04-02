"""
Subscription and Business Rules Tests for FalcoElectrec
"""
import pytest
from app.models.user import User, UserRole, UserStatus
from app.models.engineer_profile import EngineerProfile, SubscriptionStatus
from app.models.request import Request, RequestStatus
from datetime import date, timedelta


# Strong password for tests (matches conftest.py)
TEST_PASSWORD = 'TestPass123'


class TestSubscriptionGating:
    """Test engineer subscription gating."""
    
    def test_expired_subscription_blocks_accept(self, client, customer_user, app):
        """Test engineer with expired subscription cannot accept requests."""
        from app.extensions import db
        
        # Create engineer with expired subscription
        expired_engineer = User(
            name='Expired Engineer',
            email='expired.eng@test.com',
            role=UserRole.ENGINEER.value,
            status=UserStatus.ACTIVE.value
        )
        expired_engineer.set_password(TEST_PASSWORD)
        db.session.add(expired_engineer)
        db.session.flush()
        
        profile = EngineerProfile(
            user_id=expired_engineer.id,
            specialization='Plumbing',
            years_exp=3,
            subscription_status=SubscriptionStatus.EXPIRED.value,
            subscription_expiry=date.today() - timedelta(days=5)  # Expired 5 days ago
        )
        db.session.add(profile)
        db.session.commit()
        
        # Create a request as customer
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        customer_token = login_response.get_json()['access_token']
        
        create_response = client.post('/api/requests', json={
            'type': 'quick',
            'description': 'Need quick repair',
            'location_text': '123 Main St, Hebron'
        }, headers={'Authorization': f'Bearer {customer_token}'})
        
        request_id = create_response.get_json()['request']['id']
        
        # Try to accept as expired engineer
        login_response = client.post('/api/auth/login', json={
            'email': 'expired.eng@test.com',
            'password': TEST_PASSWORD
        })
        engineer_token = login_response.get_json()['access_token']
        
        response = client.post(f'/api/requests/{request_id}/accept', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        assert response.status_code == 403
        assert 'subscription' in response.get_json()['error'].lower()
    
    def test_active_subscription_allows_accept(self, client, customer_user, engineer_user, sample_services, app):
        """Test engineer with active subscription can accept requests."""
        # Create a request as customer
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        customer_token = login_response.get_json()['access_token']
        
        create_response = client.post('/api/requests', json={
            'service_id': 'S1',
            'type': 'late',
            'description': 'Need repair work done',
            'location_text': '123 Main St, Hebron'
        }, headers={'Authorization': f'Bearer {customer_token}'})
        
        request_id = create_response.get_json()['request']['id']
        
        # Accept as active engineer
        login_response = client.post('/api/auth/login', json={
            'email': 'engineer@test.com',
            'password': TEST_PASSWORD
        })
        engineer_token = login_response.get_json()['access_token']
        
        response = client.post(f'/api/requests/{request_id}/accept', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        assert response.status_code == 200
        assert response.get_json()['request']['status'] == 'accepted'


class TestPendingEngineerBlocking:
    """Test pending engineer cannot access protected features."""
    
    def test_pending_engineer_cannot_login(self, client, app):
        """Test engineer pending approval cannot login."""
        from app.extensions import db
        
        # Create pending engineer
        pending_engineer = User(
            name='Pending Engineer',
            email='pending.eng@test.com',
            role=UserRole.ENGINEER.value,
            status=UserStatus.PENDING.value  # Not yet approved
        )
        pending_engineer.set_password(TEST_PASSWORD)
        db.session.add(pending_engineer)
        db.session.flush()
        
        profile = EngineerProfile(
            user_id=pending_engineer.id,
            specialization='Plumbing',
            years_exp=3,
            subscription_status=SubscriptionStatus.ACTIVE.value
        )
        db.session.add(profile)
        db.session.commit()
        
        # Pending engineer tries to login
        login_response = client.post('/api/auth/login', json={
            'email': 'pending.eng@test.com',
            'password': TEST_PASSWORD
        })
        
        # Should be blocked from login
        assert login_response.status_code == 403
        assert 'pending' in login_response.get_json()['error'].lower()


class TestCommissionRules:
    """Test commission calculation rules."""
    
    def test_commission_zero_under_700(self, client, customer_user, engineer_user, app):
        """Test 0% commission for jobs <= 700 NIS."""
        from app.extensions import db
        from app.models.service import Feature, Service
        from app.models.transaction import Transaction
        
        # Create a service with price <= 700
        feature = Feature(
            id='F_TEST1',
            name='Test Feature',
            icon='Tool',
            description='Test'
        )
        db.session.add(feature)
        
        service = Service(
            id='S_LOW',
            feature_id='F_TEST1',
            name='Low Price Service',
            description='Test',
            base_price=500  # Under 700
        )
        db.session.add(service)
        db.session.commit()
        
        # Create and complete request
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        customer_token = login_response.get_json()['access_token']
        
        create_response = client.post('/api/requests', json={
            'service_id': 'S_LOW',
            'type': 'late',
            'description': 'Need low price service',
            'location_text': '123 Main St, Hebron'
        }, headers={'Authorization': f'Bearer {customer_token}'})
        
        request_id = create_response.get_json()['request']['id']
        
        # Accept as engineer
        login_response = client.post('/api/auth/login', json={
            'email': 'engineer@test.com',
            'password': TEST_PASSWORD
        })
        engineer_token = login_response.get_json()['access_token']
        
        client.post(f'/api/requests/{request_id}/accept', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        client.post(f'/api/requests/{request_id}/complete', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        # Verify commission is 0
        transaction = Transaction.query.filter_by(request_id=request_id).first()
        assert transaction is not None
        assert transaction.gross_amount == 500
        assert transaction.commission_amount == 0
        assert transaction.net_amount == 500
    
    def test_commission_5_percent_over_700(self, client, customer_user, engineer_user, app):
        """Test 5% commission for jobs > 700 NIS."""
        from app.extensions import db
        from app.models.service import Feature, Service
        from app.models.transaction import Transaction
        
        # Create a service with price > 700
        feature = Feature(
            id='F_TEST2',
            name='Test Feature 2',
            icon='Tool',
            description='Test'
        )
        db.session.add(feature)
        
        service = Service(
            id='S_HIGH',
            feature_id='F_TEST2',
            name='High Price Service',
            description='Test',
            base_price=1000  # Over 700
        )
        db.session.add(service)
        db.session.commit()
        
        # Create and complete request
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        customer_token = login_response.get_json()['access_token']
        
        create_response = client.post('/api/requests', json={
            'service_id': 'S_HIGH',
            'type': 'late',
            'description': 'Need high price service',
            'location_text': '123 Main St, Hebron'
        }, headers={'Authorization': f'Bearer {customer_token}'})
        
        request_id = create_response.get_json()['request']['id']
        
        # Accept as engineer
        login_response = client.post('/api/auth/login', json={
            'email': 'engineer@test.com',
            'password': TEST_PASSWORD
        })
        engineer_token = login_response.get_json()['access_token']
        
        client.post(f'/api/requests/{request_id}/accept', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        client.post(f'/api/requests/{request_id}/complete', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        # Verify commission is 5%
        transaction = Transaction.query.filter_by(request_id=request_id).first()
        assert transaction is not None
        assert transaction.gross_amount == 1000
        assert transaction.commission_amount == 50  # 5% of 1000
        assert transaction.net_amount == 950  # 1000 - 50


class TestPaginationEndpoints:
    """Test pagination on list endpoints."""
    
    def test_requests_pagination(self, client, customer_user, app):
        """Test requests endpoint returns pagination info."""
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.get('/api/requests?page=1&per_page=5', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'pagination' in data
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 5
    
    def test_admin_users_pagination(self, client, admin_user, app):
        """Test admin users endpoint returns pagination info."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.get('/api/admin/users?page=1&per_page=10', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'pagination' in data
        assert 'total' in data['pagination']
        assert 'pages' in data['pagination']
