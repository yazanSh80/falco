"""
Admin Endpoint Tests for FalcoElectrec
"""
import pytest
from app.models.user import User, UserRole, UserStatus
from app.models.engineer_profile import EngineerProfile, SubscriptionStatus
from datetime import date, timedelta


# Strong password for tests (matches conftest.py)
TEST_PASSWORD = 'TestPass123'


class TestAdminDashboard:
    """Test admin dashboard and statistics."""
    
    def test_admin_get_stats(self, client, admin_user, app):
        """Test admin can get dashboard statistics."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.get('/api/admin/stats', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'users' in data
        assert 'requests' in data
        assert 'finance' in data


class TestUserManagement:
    """Test admin user management."""
    
    def test_admin_list_users_with_pagination(self, client, admin_user, customer_user, app):
        """Test admin can list users with pagination."""
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
        assert 'users' in data
        assert 'pagination' in data
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 10
    
    def test_admin_block_user(self, client, admin_user, customer_user, app):
        """Test admin can block a user."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        # Get customer ID
        from app.extensions import db
        customer = User.query.filter_by(email='customer@test.com').first()
        customer_id = customer.id
        
        response = client.post(f'/api/admin/users/{customer_id}/block', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        assert response.get_json()['user']['status'] == 'blocked'
    
    def test_admin_unblock_user(self, client, admin_user, app):
        """Test admin can unblock a user."""
        from app.extensions import db
        
        # Create a blocked user
        blocked_user = User(
            name='Blocked User',
            email='blocked@test.com',
            role=UserRole.CUSTOMER.value,
            status=UserStatus.BLOCKED.value
        )
        blocked_user.set_password(TEST_PASSWORD)
        db.session.add(blocked_user)
        db.session.commit()
        user_id = blocked_user.id
        
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.post(f'/api/admin/users/{user_id}/unblock', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        assert response.get_json()['user']['status'] == 'active'


class TestEngineerApproval:
    """Test admin engineer approval workflow."""
    
    def test_admin_list_pending_engineers(self, client, admin_user, app):
        """Test admin can list pending engineers."""
        from app.extensions import db
        
        # Create pending engineer
        engineer = User(
            name='Pending Engineer',
            email='pending.eng@test.com',
            role=UserRole.ENGINEER.value,
            status=UserStatus.PENDING.value
        )
        engineer.set_password(TEST_PASSWORD)
        db.session.add(engineer)
        db.session.flush()
        
        profile = EngineerProfile(
            user_id=engineer.id,
            specialization='Plumbing',
            years_exp=3,
            subscription_status=SubscriptionStatus.ACTIVE.value
        )
        db.session.add(profile)
        db.session.commit()
        
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.get('/api/admin/engineers/pending', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['count'] >= 1
        assert any(e['email'] == 'pending.eng@test.com' for e in data['pending_engineers'])
    
    def test_admin_approve_engineer(self, client, admin_user, app):
        """Test admin can approve an engineer."""
        from app.extensions import db
        
        # Create pending engineer
        engineer = User(
            name='Approve Me',
            email='approve.eng@test.com',
            role=UserRole.ENGINEER.value,
            status=UserStatus.PENDING.value
        )
        engineer.set_password(TEST_PASSWORD)
        db.session.add(engineer)
        db.session.flush()
        
        profile = EngineerProfile(
            user_id=engineer.id,
            specialization='Electricity',
            years_exp=5,
            subscription_status=SubscriptionStatus.ACTIVE.value
        )
        db.session.add(profile)
        db.session.commit()
        engineer_id = engineer.id
        
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.post(f'/api/admin/engineers/{engineer_id}/accept', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        assert response.get_json()['engineer']['status'] == 'active'

    def test_admin_update_engineer_domain_suitability(self, client, admin_user, engineer_user, app):
        """Test admin can set provider domain suitability."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']

        response = client.patch(
            f'/api/admin/engineers/{engineer_user.id}/permissions',
            json={'domain': 'low_current'},
            headers={'Authorization': f'Bearer {token}'}
        )

        assert response.status_code == 200
        assert response.get_json()['engineer']['profile']['domain'] == 'low_current'


class TestAreaManagement:
    """Test admin area management workflow."""

    def test_admin_area_create_list_and_update(self, client, admin_user, app):
        """Test admin can create, list, and update an area."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        create_response = client.post('/api/admin/areas', json={
            'name': 'P5 Area',
            'name_ar': 'منطقة P5',
            'description': 'Area management smoke test'
        }, headers=headers)

        assert create_response.status_code == 201
        area = create_response.get_json()['area']
        assert area['name'] == 'P5 Area'
        assert area['is_active'] is True

        list_response = client.get(
            '/api/admin/areas?include_inactive=true&include_stats=false',
            headers=headers
        )
        assert list_response.status_code == 200
        areas = list_response.get_json()['areas']
        assert any(item['id'] == area['id'] for item in areas)

        update_response = client.patch(
            f"/api/admin/areas/{area['id']}",
            json={'is_active': False},
            headers=headers
        )

        assert update_response.status_code == 200
        assert update_response.get_json()['area']['is_active'] is False


class TestRequestTriage:
    """Test admin triage queue for inspection and project requests."""

    def test_admin_triage_queue_lists_pending_inspection_and_project_requests(
        self, client, admin_user, customer_user, sample_services, app
    ):
        """Test admin can see inspection/project requests awaiting review."""
        from app.extensions import db
        from app.models.request import Request, RequestIntent, RequestStatus, RequestType

        inspection_request = Request(
            request_number='TRIAGE-INSP-1',
            customer_id=customer_user.id,
            type=RequestType.QUICK.value,
            request_intent=RequestIntent.INSPECTION.value,
            category='electrical',
            description='Need inspection before work',
            location_text='Ramallah',
            status=RequestStatus.PENDING.value
        )
        project_request = Request(
            request_number='TRIAGE-PROJ-1',
            customer_id=customer_user.id,
            type=RequestType.LATE.value,
            request_intent=RequestIntent.PROJECT_SPECIAL.value,
            category='solar',
            description='Solar project inquiry',
            location_text='Hebron',
            status=RequestStatus.PENDING.value
        )
        service_request = Request(
            request_number='TRIAGE-SVC-1',
            customer_id=customer_user.id,
            service_id=sample_services['service'].id,
            type=RequestType.QUICK.value,
            request_intent=RequestIntent.BOOK_SERVICE.value,
            description='Book fixed service',
            location_text='Nablus',
            status=RequestStatus.PENDING.value
        )
        db.session.add_all([inspection_request, project_request, service_request])
        db.session.commit()

        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']

        response = client.get('/api/admin/requests/triage', headers={
            'Authorization': f'Bearer {token}'
        })

        assert response.status_code == 200
        data = response.get_json()
        request_numbers = {item['request_number'] for item in data['requests']}
        assert 'TRIAGE-INSP-1' in request_numbers
        assert 'TRIAGE-PROJ-1' in request_numbers
        assert 'TRIAGE-SVC-1' not in request_numbers
        assert data['summary']['count'] == 2

    def test_admin_triage_can_route_project_request_to_engineer(
        self, client, admin_user, customer_user, engineer_user, app
    ):
        """Test admin can review and route project/special requests."""
        from app.extensions import db
        from app.models.request import Request, RequestIntent, RequestStatus, RequestType

        project_request = Request(
            request_number='TRIAGE-ROUTE-1',
            customer_id=customer_user.id,
            type=RequestType.LATE.value,
            request_intent=RequestIntent.PROJECT_SPECIAL.value,
            category='fiber',
            description='Fiber extension project inquiry',
            location_text='Ramallah',
            status=RequestStatus.SUBMITTED.value
        )
        db.session.add(project_request)
        db.session.commit()

        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']

        review_response = client.patch(
            f'/api/admin/requests/{project_request.id}/triage',
            json={'status': 'under_review'},
            headers={'Authorization': f'Bearer {token}'}
        )
        assert review_response.status_code == 200
        assert review_response.get_json()['request']['status'] == RequestStatus.UNDER_REVIEW.value

        route_response = client.patch(
            f'/api/admin/requests/{project_request.id}/triage',
            json={'status': 'routed', 'engineer_id': engineer_user.id},
            headers={'Authorization': f'Bearer {token}'}
        )
        assert route_response.status_code == 200
        routed_request = route_response.get_json()['request']
        assert routed_request['status'] == RequestStatus.ROUTED.value
        assert routed_request['engineer_id'] == engineer_user.id


class TestAdminCreation:
    """Test admin creation by admin."""
    
    def test_admin_create_new_admin(self, client, admin_user, app):
        """Test admin can create another admin."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.post('/api/admin/admins', json={
            'name': 'New Admin',
            'email': 'newadmin@test.com',
            'password': TEST_PASSWORD
        }, headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['admin']['role'] == 'admin'
        assert data['admin']['status'] == 'active'
    
    def test_admin_create_admin_weak_password(self, client, admin_user, app):
        """Test admin creation fails with weak password."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.post('/api/admin/admins', json={
            'name': 'Weak Password Admin',
            'email': 'weakadmin@test.com',
            'password': 'weak'  # Too short, no uppercase, no digit
        }, headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 400
        assert 'validation' in response.get_json()['error'].lower()
