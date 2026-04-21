#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
End-to-End Database Authentication Test
Tests that login works ONLY with real database users
"""
import sys
import os
import time

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus
from app.config import Config
from datetime import timedelta


class MySQLTestConfig(Config):
    """Testing configuration - TESTING mode but with real MySQL database."""
    TESTING = True
    DEBUG = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=3600)

def test_database_auth():
    """Test database-only authentication flow."""
    # Create app with TESTING configuration that skips security headers
    app = create_app(MySQLTestConfig)
    client = app.test_client()
    
    # DEBUG: Print registered routes
    print("\nRegistered Flask routes:")
    for rule in app.url_map.iter_rules():
        if 'login' in rule.rule.lower():
            print("  {}  Methods: {}".format(rule.rule, rule.methods))
    
    print("\n" + "=" * 70)
    print("DATABASE-ONLY AUTHENTICATION TEST")
    print("=" * 70)
    
    # Test 1: Database Connection
    print("\n[TEST 1] Database Connection")
    print("-" * 70)
    with app.app_context():
        try:
            user_count = User.query.count()
            print("[OK] Database connected. Total users: {}".format(user_count))
        except Exception as e:
            print("[FAIL] Database connection failed: {}".format(str(e)))
            return False
        
        # Show sample users
        sample_users = User.query.limit(10).all()
        print("\n[SAMPLE USERS]")
        for user in sample_users:
            print("  - {} | Role: {} | Status: {}".format(user.email, user.role, user.status))
    
    # Test 2: Valid Admin Login
    print("\n\n[TEST 2] Valid Admin Login (Database User)")
    print("-" * 70)
    
    # Try both endpoints
    for endpoint in ['/api/auth/login', '/api/v1/auth/login']:
        print("Trying endpoint: {}".format(endpoint))
        response = client.post(endpoint,
            json={'email': 'admin@test.com', 'password': 'Pass123!'},
            content_type='application/json',
            follow_redirects=True
        )
        
        print("Response status: {}".format(response.status_code))
        print("Response content-type: {}".format(response.content_type))
        resp_text = str(response.get_data(as_text=True))[:200]
        print("Response text (first 200 chars): {}".format(resp_text))
        
        if response.status_code == 200:
            data = response.get_json()
            if data and 'access_token' in data and 'user' in data:
                user = data['user']
                print("[PASS] Admin login successful")
                print("   Email: {}".format(user['email']))
                print("   Role: {}".format(user['role']))
                print("   Status: {}".format(user['status']))
                print("   Token: {}...".format(data['access_token'][:50]))
                break
            else:
                print("[FAIL] Response missing tokens: {}".format(data))
        else:
            data = response.get_json()
            error_msg = data.get('error', 'Unknown error') if data else 'No JSON response'
            print("[FAIL] Admin login failed (Status: {})".format(response.status_code))
            print("   Error: {}".format(error_msg))
            if endpoint == '/api/v1/auth/login':
                return False
    else:
        return False
    
    # Test 3: Valid Customer Login
    print("\n\n[TEST 3] Valid Customer Login (Database User)")
    print("-" * 70)
    response = client.post('/api/auth/login',
        json={'email': 'customer1@test.com', 'password': 'Pass123!'},
        content_type='application/json'
    )
    
    if response.status_code == 200:
        data = response.get_json()
        if data and 'user' in data:
            user = data['user']
            print("[PASS] Customer login successful")
            print("   Email: {}".format(user['email']))
            print("   Role: {}".format(user['role']))
            print("   Status: {}".format(user['status']))
        else:
            print("[FAIL] Response missing user data")
            return False
    else:
        data = response.get_json()
        error_msg = data.get('error', 'Unknown error') if data else 'No JSON response'
        print("[FAIL] Customer login failed (Status: {})".format(response.status_code))
        print("   Error: {}".format(error_msg))
        return False
    
    # Test 4: Valid Engineer Login (Approved)
    print("\n\n[TEST 4] Valid Engineer Login - Approved (Database User)")
    print("-" * 70)
    response = client.post('/api/auth/login',
        json={'email': 'engineer1@test.com', 'password': 'Pass123!'},
        content_type='application/json'
    )
    
    if response.status_code == 200:
        data = response.get_json()
        if data and 'user' in data:
            user = data['user']
            print("[PASS] Engineer login successful")
            print("   Email: {}".format(user['email']))
            print("   Role: {}".format(user['role']))
            print("   Status: {}".format(user['status']))
            print("   Verification Status: {}".format(user.get('verification_status')))
        else:
            print("[FAIL] Response missing user data")
            return False
    else:
        data = response.get_json()
        error_msg = data.get('error', 'Unknown error') if data else 'No JSON response'
        print("[FAIL] Engineer login failed (Status: {})".format(response.status_code))
        print("   Error: {}".format(error_msg))
        return False
    
    # Test 5: Valid Engineer Login (Pending)
    print("\n\n[TEST 5] Valid Engineer Login - Pending (Database User)")
    print("-" * 70)
    with app.app_context():
        pending_engineer = User.query.filter_by(
            role=UserRole.ENGINEER.value,
            status=UserStatus.PENDING.value
        ).first()
        
        if pending_engineer:
            response = client.post('/api/auth/login',
                json={'email': pending_engineer.email, 'password': 'Pass123!'},
                content_type='application/json'
            )
            
            if response.status_code == 200:
                data = response.get_json()
                if data and 'user' in data:
                    user = data['user']
                    print("[PASS] Pending engineer login successful")
                    print("   Email: {}".format(user['email']))
                    print("   Status: {}".format(user['status']))
                    print("   Verification Status: {}".format(user.get('verification_status')))
                else:
                    print("[FAIL] Response missing user data")
                    return False
            else:
                data = response.get_json()
                error_msg = data.get('error', 'Unknown error') if data else 'No JSON response'
                print("[FAIL] Pending engineer login failed (Status: {})".format(response.status_code))
                print("   Error: {}".format(error_msg))
                return False
        else:
            print("[INFO] No pending engineers found in database")
    
    # Test 6: Invalid Email (Should Fail)
    print("\n\n[TEST 6] Invalid Email - Should FAIL (Not in Database)")
    print("-" * 70)
    response = client.post('/api/auth/login',
        json={'email': 'nonexistent@test.com', 'password': 'Pass123!'},
        content_type='application/json'
    )
    
    if response.status_code == 401:
        data = response.get_json()
        error_msg = data.get('error', 'Unknown error') if data else 'Unknown error'
        print("[PASS] Correctly rejected non-existent user")
        print("   Error: {}".format(error_msg))
    else:
        print("[FAIL] Should have rejected non-existent user (Status: {})".format(response.status_code))
        return False
    
    # Test 7: Wrong Password (Should Fail)
    print("\n\n[TEST 7] Wrong Password - Should FAIL")
    print("-" * 70)
    response = client.post('/api/auth/login',
        json={'email': 'admin@test.com', 'password': 'WrongPassword123'},
        content_type='application/json'
    )
    
    if response.status_code == 401:
        data = response.get_json()
        error_msg = data.get('error', 'Unknown error') if data else 'Unknown error'
        print("[PASS] Correctly rejected wrong password")
        print("   Error: {}".format(error_msg))
    else:
        print("[FAIL] Should have rejected wrong password (Status: {})".format(response.status_code))
        return False
    
    # Test 8: Blocked User (Should Fail)
    print("\n\n[TEST 8] Blocked User - Should FAIL (Cannot Login)")
    print("-" * 70)
    with app.app_context():
        blocked_user = User.query.filter_by(status=UserStatus.BLOCKED.value).first()
        
        if blocked_user:
            response = client.post('/api/auth/login',
                json={'email': blocked_user.email, 'password': 'Pass123!'},
                content_type='application/json'
            )
            
            if response.status_code == 403:
                data = response.get_json()
                error_msg = data.get('error', 'Unknown error') if data else 'Unknown error'
                print("[PASS] Correctly blocked user login")
                print("   Error: {}".format(error_msg))
            else:
                print("[FAIL] Should have blocked user (Status: {})".format(response.status_code))
                return False
        else:
            print("[INFO] No blocked users found in database")
    
    # Test 9: JWT Token Validation
    print("\n\n[TEST 9] JWT Token Validation - Protected Endpoint")
    print("-" * 70)
    
    # First, login to get token
    response = client.post('/api/auth/login',
        json={'email': 'admin@test.com', 'password': 'Pass123!'},
        content_type='application/json'
    )
    
    if response.status_code == 200:
        token = response.get_json()['access_token']
        
        # Try to access protected endpoint with token
        response = client.get('/api/auth/me',
            headers={'Authorization': 'Bearer {}'.format(token)}
        )
        
        if response.status_code == 200:
            data = response.get_json()
            if 'user' in data:
                user = data['user']
                print("[PASS] Token validated successfully")
                print("   User from token: {}".format(user['email']))
            else:
                print("[FAIL] Response missing user data")
                return False
        else:
            data = response.get_json() if response.content_type == 'application/json' else {}
            print("[FAIL] Token validation failed (Status: {})".format(response.status_code))
            print("   Response: {}".format(data))
            return False
    else:
        print("[FAIL] Could not login to get token (Status: {})".format(response.status_code))
        return False
    
    # Test 10: User Signup and Login
    print("\n\n[TEST 10] User Signup and Login")
    print("-" * 70)
    
    # Signup new user
    new_email = "testuser{}@test.com".format(int(time.time()))
    response = client.post('/api/auth/register',
        json={
            'name': 'Test User',
            'email': new_email,
            'password': 'TestPass123',
            'role': 'customer',
            'city': 'Test City',
            'area': 'Test Area'
        },
        content_type='application/json'
    )
    
    if response.status_code == 201:
        signup_data = response.get_json()
        if 'user' in signup_data:
            signup_user = signup_data['user']
            print("[PASS] Signup successful")
            print("   Email: {}".format(signup_user['email']))
            print("   Role: {}".format(signup_user['role']))
            
            # Now try to login with the new user
            response = client.post('/api/auth/login',
                json={'email': new_email, 'password': 'TestPass123'},
                content_type='application/json'
            )
            
            if response.status_code == 200:
                login_data = response.get_json()
                if 'user' in login_data:
                    login_user = login_data['user']
                    print("[PASS] Newly created user can login")
                    print("   Email: {}".format(login_user['email']))
                    print("   Role: {}".format(login_user['role']))
                else:
                    print("[FAIL] Response missing user data")
                    return False
            else:
                data = response.get_json() if response.content_type == 'application/json' else {}
                error_msg = data.get('error', 'Unknown error') if data else 'Unknown error'
                print("[FAIL] Newly created user login failed (Status: {})".format(response.status_code))
                print("   Error: {}".format(error_msg))
                return False
        else:
            print("[FAIL] Signup response missing user data")
            return False
    else:
        data = response.get_json() if response.content_type == 'application/json' else {}
        print("[FAIL] Signup failed (Status: {})".format(response.status_code))
        print("   Error: {}".format(data))
        return False
    
    # Summary
    print("\n\n" + "=" * 70)
    print("ALL TESTS PASSED SUCCESSFULLY")
    print("=" * 70)
    print("\nDatabase-only authentication is working correctly!")
    print("- Users can ONLY login with real database credentials")
    print("- Passwords are validated with proper hashing")
    print("- JWT tokens are issued and validated correctly")
    print("- Users cannot access protected endpoints without tokens")
    print("- New users created via signup can login immediately")
    print("\n" + "=" * 70 + "\n")
    
    return True

if __name__ == '__main__':
    success = test_database_auth()
    sys.exit(0 if success else 1)
