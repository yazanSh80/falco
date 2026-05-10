"""
Request Lifecycle Tests for FalcoElectrec
"""
import pytest
from app.models.request import Request, RequestIntent, RequestStatus
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
        assert data['request']['type'] == 'late'
        assert data['request']['urgency'] == 'late'
        assert data['request']['request_intent'] == RequestIntent.BOOK_SERVICE.value
        assert data['request']['price_at_request'] == 120

    def test_customer_create_inspection_request(self, client, customer_user, app):
        """Test customer creating a free-form inspection request."""
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        response = client.post('/api/requests', json={
            'type': 'quick',
            'request_intent': 'inspection',
            'category': 'Electrical inspection',
            'description': 'Need an electrician to inspect a recurring issue',
            'location_text': '123 Main St, Hebron'
        }, headers=headers)

        assert response.status_code == 201
        data = response.get_json()
        assert data['request']['type'] == 'quick'
        assert data['request']['urgency'] == 'quick'
        assert data['request']['request_intent'] == RequestIntent.INSPECTION.value
        assert data['request']['service_id'] is None
        assert data['request']['price_at_request'] is None

    def test_book_service_requires_service_id_when_explicit(self, client, customer_user, app):
        """Test explicit book_service intent needs a concrete service."""
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        response = client.post('/api/requests', json={
            'type': 'quick',
            'request_intent': 'book_service',
            'category': 'Electricity',
            'description': 'Need direct service booking without picking service',
            'location_text': '123 Main St, Hebron'
        }, headers=headers)

        assert response.status_code == 400
        assert 'service_id' in response.get_json()['details']

    def test_customer_create_project_special_request(self, client, customer_user, app):
        """Test customer creating a free-form project/special request."""
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        response = client.post('/api/requests', json={
            'type': 'late',
            'request_intent': 'project_special',
            'domain': 'solar',
            'description': 'Need assessment for a solar project at home',
            'location_text': '123 Main St, Hebron'
        }, headers=headers)

        assert response.status_code == 201
        data = response.get_json()
        assert data['request']['request_intent'] == RequestIntent.PROJECT_SPECIAL.value
        assert data['request']['status'] == RequestStatus.SUBMITTED.value
        assert data['request']['category'] == 'solar'
        assert data['request']['service_id'] is None
        assert data['request']['price_at_request'] is None

    def test_project_special_rejects_service_id(self, client, customer_user, sample_services, app):
        """Test project/special intake is not tied to fixed service pricing."""
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        response = client.post('/api/requests', json={
            'service_id': 'S1',
            'type': 'late',
            'request_intent': 'project_special',
            'category': 'Solar project',
            'description': 'Need project intake but not a fixed service booking',
            'location_text': '123 Main St, Hebron'
        }, headers=headers)

        assert response.status_code == 400
        assert 'service_id' in response.get_json()['details']

    def test_legacy_request_intent_mapping(self, customer_user, sample_services, app):
        """Test old rows are read with inferred intent without mutation."""
        from app.extensions import db

        with_service = Request(
            request_number='R-LEG1',
            customer_id=customer_user.id,
            service_id='S1',
            type='late',
            category='Electricity',
            description='Legacy service-linked request',
            location_text='123 Main St, Hebron',
            status=RequestStatus.PENDING.value
        )
        without_service = Request(
            request_number='R-LEG2',
            customer_id=customer_user.id,
            type='quick',
            category='General inspection',
            description='Legacy free-form request',
            location_text='123 Main St, Hebron',
            status=RequestStatus.PENDING.value
        )
        db.session.add_all([with_service, without_service])
        db.session.commit()

        assert with_service.request_intent is None
        assert with_service.to_dict()['request_intent'] == RequestIntent.BOOK_SERVICE.value
        assert without_service.request_intent is None
        assert without_service.to_dict()['request_intent'] == RequestIntent.INSPECTION.value
    
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
