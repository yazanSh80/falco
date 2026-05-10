#!/usr/bin/env python
"""
Test Login API Endpoint
Tests if the login API endpoint works
"""
import sys
import os
import json

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def test_api_login():
    """Test the login API endpoint."""
    app = create_app()
    app.config['TESTING'] = True  # Disable rate limiting in testing mode
    
    # Use the test client with redirect handling
    client = app.test_client()
    
    print("[TEST] Login API Endpoint")
    print("=" * 60)
    
    test_credentials = [
        {'email': 'admin@test.com', 'password': 'Pass123!', 'name': 'Admin'},
        {'email': 'customer1@test.com', 'password': 'Pass123!', 'name': 'Customer'},
        {'email': 'engineer1@test.com', 'password': 'Pass123!', 'name': 'Engineer'},
    ]
    
    for test in test_credentials:
        email = test['email']
        
        print(f"\n[TEST] Logging in as {test['name']}: {email}")
        
        # Send login request (try both endpoints)
        response = client.post('/api/auth/login', 
            json={'email': email, 'password': test['password']},
            content_type='application/json',
            follow_redirects=True
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.get_json()
            if data and 'access_token' in data:
                print(f"[SUCCESS] Login successful!")
                print(f"  - Access Token: {data['access_token'][:20]}...")
                print(f"  - User Role: {data['user']['role']}")
                print(f"  - User Status: {data['user']['status']}")
            else:
                print(f"[PARTIAL] Got 200 but no access token")
                print(f"  Response: {data}")
        elif response.status_code == 302:
            print(f"[REDIRECT] Got 302 redirect")
            print(f"  Location: {response.headers.get('Location')}")
            print(f"  Response: {response.data[:200]}")
        else:
            data = response.get_json()
            print(f"[FAIL] Login failed")
            print(f"  Error: {data}")
    
    print("\n" + "=" * 60)


def test_wrong_password():
    """Test login with wrong password."""
    app = create_app()
    app.config['TESTING'] = True  # Disable rate limiting
    client = app.test_client()
    
    print("\n[TEST] Login with Wrong Password")
    print("=" * 60)
    
    response = client.post('/api/auth/login',
        json={'email': 'admin@test.com', 'password': 'WrongPassword123'},
        content_type='application/json',
        follow_redirects=True
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.get_json()}")


if __name__ == '__main__':
    test_api_login()
    test_wrong_password()
    print("\n[DONE]")
