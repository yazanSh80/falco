"""
Authentication Tests for FalcoElectrec
"""
import pytest
from app.models.user import User, UserRole, UserStatus


# Strong password for tests (meets requirements: 8+ chars, uppercase, lowercase, digit)
TEST_PASSWORD = 'TestPass123'


class TestAuth:
    """Test authentication endpoints."""
    
    def test_register_customer(self, client, app):
        """Test customer registration."""
        response = client.post('/api/auth/register', json={
            'name': 'New Customer',
            'email': 'newcustomer@test.com',
            'password': TEST_PASSWORD,
            'role': 'customer',
            'phone': '0599999999',
            'city': 'Hebron',
            'area': 'Downtown'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert 'access_token' in data
        assert data['user']['email'] == 'newcustomer@test.com'
        assert data['user']['role'] == 'customer'
    
    def test_register_engineer(self, client, app):
        """Test engineer registration."""
        response = client.post('/api/auth/register', json={
            'name': 'New Engineer',
            'email': 'newengineer@test.com',
            'password': TEST_PASSWORD,
            'role': 'engineer',
            'phone': '0599888888',
            'city': 'Ramallah',
            'area': 'Downtown',
            'specialization': 'Plumbing',
            'years_exp': 5
        })
        
        assert response.status_code == 201
        data = response.get_json()
        # Engineers don't get token immediately (pending approval)
        assert 'pending' in data['message'].lower()
        assert data['user']['status'] == 'pending'
    
    def test_register_duplicate_email(self, client, customer_user, app):
        """Test registration with existing email."""
        response = client.post('/api/auth/register', json={
            'name': 'Duplicate',
            'email': 'customer@test.com',
            'password': TEST_PASSWORD,
            'role': 'customer'
        })
        
        assert response.status_code == 409
        assert 'already registered' in response.get_json()['error'].lower()
    
    def test_register_weak_password(self, client, app):
        """Test registration with weak password fails."""
        response = client.post('/api/auth/register', json={
            'name': 'Test User',
            'email': 'weak@test.com',
            'password': 'weak',  # Too short, no uppercase, no digit
            'role': 'customer'
        })
        
        assert response.status_code == 400
        assert 'validation' in response.get_json()['error'].lower()
    
    def test_login_success(self, client, customer_user, app):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'access_token' in data
        assert 'user' in data
        assert data['user']['email'] == 'customer@test.com'
    
    def test_login_wrong_password(self, client, customer_user, app):
        """Test login with wrong password."""
        response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': 'WrongPassword123'
        })
        
        assert response.status_code == 401
        assert 'invalid' in response.get_json()['error'].lower()
    
    def test_login_nonexistent_user(self, client, app):
        """Test login with non-existent user."""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@test.com',
            'password': TEST_PASSWORD
        })
        
        assert response.status_code == 401
    
    def test_get_me_authenticated(self, client, customer_user, app):
        """Test getting current user when authenticated."""
        # Login first
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        # Get current user
        response = client.get('/api/auth/me', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
        assert response.get_json()['user']['email'] == 'customer@test.com'
    
    def test_get_me_unauthenticated(self, client, app):
        """Test getting current user without authentication."""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401


class TestRBAC:
    """Test Role-Based Access Control."""
    
    def test_customer_cannot_access_admin(self, client, customer_user, app):
        """Test customer cannot access admin endpoints."""
        login_response = client.post('/api/auth/login', json={
            'email': 'customer@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.get('/api/admin/users', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 403
    
    def test_admin_can_access_admin(self, client, admin_user, app):
        """Test admin can access admin endpoints."""
        login_response = client.post('/api/auth/login', json={
            'email': 'admin@test.com',
            'password': TEST_PASSWORD
        })
        token = login_response.get_json()['access_token']
        
        response = client.get('/api/admin/users', headers={
            'Authorization': f'Bearer {token}'
        })
        
        assert response.status_code == 200
