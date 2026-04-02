"""
Request Lifecycle Tests for FalcoElectrec
"""
import pytest
from app.models.request import Request, RequestStatus
from app.models.transaction import Transaction


# Strong password for tests (matches conftest.py)
TEST_PASSWORD = 'TestPass123'


class TestRequestLifecycle:
    """Test complete request lifecycle."""
    
    def test_customer_create_request(self, client, customer_user, sample_services, app):
        """Test customer creating a new request."""
        # Login as customer
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        
        # Create request
        response = client.post('/api/requests', json={
            'service_id': 'S1',
            'type': 'late',
            'category': 'Electricity',
            'description': 'Need lighting repair in living room',
            'location_text': '123 Main St, Hebron'
        }, headers=headers)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['request']['status'] == 'pending'
        assert data['request']['price_at_request'] == 120
    
    def test_engineer_accept_request(self, client, customer_user, engineer_user, sample_services, app):
        """Test engineer accepting a request."""
        # Create request as customer
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
        
        # Login as engineer
        login_response = client.post('/api/auth/login', json={
            'email': 'engineer@test.com',
            'password': TEST_PASSWORD
        })
        engineer_token = login_response.get_json()['access_token']
        
        # Accept request
        response = client.post(f'/api/requests/{request_id}/accept', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        assert response.status_code == 200
        assert response.get_json()['request']['status'] == 'accepted'
    
    def test_engineer_complete_request(self, client, customer_user, engineer_user, sample_services, app):
        """Test engineer completing a request and transaction creation."""
        # Create and accept request
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
        
        login_response = client.post('/api/auth/login', json={
            'email': 'engineer@test.com',
            'password': TEST_PASSWORD
        })
        engineer_token = login_response.get_json()['access_token']
        
        client.post(f'/api/requests/{request_id}/accept', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        # Complete request
        response = client.post(f'/api/requests/{request_id}/complete', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        assert response.status_code == 200
        assert response.get_json()['request']['status'] == 'completed'
        
        # Verify transaction was created
        transaction = Transaction.query.filter_by(request_id=request_id).first()
        assert transaction is not None
        assert transaction.gross_amount == 120
        # 120 NIS < 700, so no commission
        assert transaction.commission_amount == 0
        assert transaction.net_amount == 120


class TestCommissionCalculation:
    """Test commission calculation rules."""
    
    def test_no_commission_under_threshold(self):
        """Test 0% commission for amounts <= 700 NIS."""
        rate, amount = Transaction.calculate_commission(500)
        assert rate == 0.0
        assert amount == 0.0
        
        rate, amount = Transaction.calculate_commission(700)
        assert rate == 0.0
        assert amount == 0.0
    
    def test_commission_above_threshold(self):
        """Test 5% commission for amounts > 700 NIS."""
        rate, amount = Transaction.calculate_commission(1000)
        assert rate == 0.05
        assert amount == 50.0
        
        rate, amount = Transaction.calculate_commission(800)
        assert rate == 0.05
        assert amount == 40.0


class TestBlockingEffect:
    """Test blocking effects on request visibility."""
    
    def test_blocked_customer_requests_not_visible(self, client, customer_user, engineer_user, app):
        """Test that blocked customers' requests are not visible to engineer."""
        from app.extensions import db
        from app.models.block import Block
        from app.models.user import User
        
        # Get user IDs
        engineer = User.query.filter_by(email='engineer@test.com').first()
        customer = User.query.filter_by(email='customer@test.com').first()
        
        block = Block(
            blocker_id=engineer.id,
            blocked_id=customer.id,
            reason='Test block'
        )
        db.session.add(block)
        db.session.commit()
        
        # Customer creates request
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        customer_token = login_response.get_json()['access_token']
        
        client.post('/api/requests', json={
            'type': 'quick',
            'category': 'Electricity',
            'description': 'Need repair work done',
            'location_text': '123 Main St, Hebron'
        }, headers={'Authorization': f'Bearer {customer_token}'})
        
        # Engineer tries to see available requests
        login_response = client.post('/api/auth/login', json={
            'email': 'engineer@test.com',
            'password': TEST_PASSWORD
        })
        engineer_token = login_response.get_json()['access_token']
        
        response = client.get('/api/requests?view=available', headers={
            'Authorization': f'Bearer {engineer_token}'
        })
        
        assert response.status_code == 200
        requests = response.get_json()['requests']
        # Should not see the blocked customer's request
        assert len(requests) == 0
