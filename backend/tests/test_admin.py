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
