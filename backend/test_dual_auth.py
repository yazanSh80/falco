#!/usr/bin/env python
"""
Test Script: Dual Authentication (Demo + Real Database Users)

Tests that both demo accounts AND real database users can login successfully.
"""
import sys
import os
import json

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus

def test_dual_authentication():
    """Test both demo and real database users."""
    app = create_app()
    app.config['TESTING'] = True  # Disable rate limiting
    client = app.test_client()
    
    print("\n" + "=" * 70)
    print("DUAL AUTHENTICATION TEST: Demo Accounts + Real Database Users")
    print("=" * 70)
    
    # Test Cases
    test_cases = [
        # ===== REAL DATABASE USERS (From Seeding) =====
        {
            'name': 'Real Database - Admin',
            'email': 'admin@test.com',
            'password': 'Pass123!',
            'expected_role': 'admin',
            'expected_status': 'active',
            'is_demo': False,
        },
        {
            'name': 'Real Database - Customer',
            'email': 'customer1@test.com',
            'password': 'Pass123!',
            'expected_role': 'customer',
            'expected_status': 'active',
            'is_demo': False,
        },
        {
            'name': 'Real Database - Engineer (Active)',
            'email': 'engineer1@test.com',
            'password': 'Pass123!',
            'expected_role': 'engineer',
            'expected_status': 'active',
            'is_demo': False,
        },
        {
            'name': 'Real Database - Super Admin (Ahmad Saqer)',
            'email': 'ahmadsaqer818@gmail.com',
            'password': 'saqer123',
            'expected_role': 'admin',
            'expected_status': 'active',
            'is_demo': False,
        },
        
        # ===== DEMO ACCOUNTS (From Config Fallback) =====
        {
            'name': 'Demo Fallback - Customer',
            'email': 'customer@test.com',
            'password': 'Pass123!',
            'expected_role': 'customer',
            'expected_status': 'active',
            'is_demo': True,
        },
        {
            'name': 'Demo Fallback - Engineer (Approved)',
            'email': 'engineer@test.com',
            'password': 'Pass123!',
            'expected_role': 'engineer',
            'expected_status': 'active',
            'is_demo': True,
        },
        {
            'name': 'Demo Fallback - Engineer (Pending)',
            'email': 'engineer.pending@test.com',
            'password': 'Pass123!',
            'expected_role': 'engineer',
            'expected_status': 'pending',
            'is_demo': True,
        },
        {
            'name': 'Demo Fallback - Admin',
            'email': 'admin@falco.local',
            'password': 'Admin@12345',
            'expected_role': 'admin',
            'expected_status': 'active',
            'is_demo': True,
        },
        
        # ===== NEGATIVE TESTS =====
        {
            'name': 'SHOULD FAIL - Demo account with wrong password',
            'email': 'customer@test.com',
            'password': 'WrongPassword',
            'expected_status_code': 401,
            'should_fail': True,
        },
        {
            'name': 'SHOULD FAIL - Non-existent account',
            'email': 'doesnotexist@test.com',
            'password': 'Pass123!',
            'expected_status_code': 401,
            'should_fail': True,
        },
    ]
    
    results = []
    passed = 0
    failed = 0
    
    for test in test_cases:
        print(f"\n[TEST] {test['name']}")
        print("-" * 70)
        
        try:
            response = client.post('/api/auth/login',
                json={
                    'email': test['email'],
                    'password': test['password']
                },
                content_type='application/json'
            )
            
            if test.get('should_fail'):
                # This test should fail
                if response.status_code == test.get('expected_status_code', 401):
                    print(f"✅ PASS: Got expected status {response.status_code}")
                    passed += 1
                    results.append({'test': test['name'], 'status': 'PASS'})
                else:
                    print(f"❌ FAIL: Expected status {test.get('expected_status_code', 401)}, got {response.status_code}")
                    print(f"   Response: {response.get_json()}")
                    failed += 1
                    results.append({'test': test['name'], 'status': 'FAIL'})
            else:
                # This test should succeed
                if response.status_code != 200:
                    print(f"❌ FAIL: Expected status 200, got {response.status_code}")
                    print(f"   Response: {response.get_json()}")
                    failed += 1
                    results.append({'test': test['name'], 'status': 'FAIL'})
                    continue
                
                data = response.get_json()
                user = data.get('user', {})
                
                # Verify response structure
                if not all(k in data for k in ['access_token', 'refresh_token', 'user']):
                    print(f"❌ FAIL: Missing required fields in response")
                    failed += 1
                    results.append({'test': test['name'], 'status': 'FAIL'})
                    continue
                
                # Verify user data
                checks = []
                
                # Check role
                if user.get('role') != test['expected_role']:
                    checks.append(f"role mismatch: expected '{test['expected_role']}', got '{user.get('role')}'")
                
                # Check status
                if user.get('status') != test['expected_status']:
                    checks.append(f"status mismatch: expected '{test['expected_status']}', got '{user.get('status')}'")
                
                # Check email
                if user.get('email') != test['email']:
                    checks.append(f"email mismatch: expected '{test['email']}', got '{user.get('email')}'")
                
                if checks:
                    print(f"❌ FAIL: {', '.join(checks)}")
                    print(f"   User data: {user}")
                    failed += 1
                    results.append({'test': test['name'], 'status': 'FAIL'})
                else:
                    auth_type = 'DEMO' if test.get('is_demo') else 'DATABASE'
                    demo_flag = ' (demo_account flag: TRUE)' if data.get('demo_account') else ''
                    print(f"✅ PASS: {auth_type} authentication successful{demo_flag}")
                    print(f"   User: {user['name']} ({user['email']})")
                    print(f"   Role: {user['role']}, Status: {user['status']}")
                    if user.get('verification_status'):
                        print(f"   Verification Status: {user['verification_status']}")
                    passed += 1
                    results.append({'test': test['name'], 'status': 'PASS'})
        
        except Exception as e:
            print(f"❌ EXCEPTION: {str(e)}")
            failed += 1
            results.append({'test': test['name'], 'status': 'EXCEPTION'})
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"✅ Passed:  {passed}")
    print(f"❌ Failed:  {failed}")
    print(f"📊 Total:   {passed + failed}")
    print(f"📈 Success Rate: {(passed / (passed + failed) * 100):.1f}%" if (passed + failed) > 0 else "N/A")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Dual authentication is working correctly.")
        print("\n✅ Demo users can login using fallback authentication")
        print("✅ Real database users can login using password verification")
        print("✅ Both paths support different user roles and statuses")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Review the output above.")
    
    print("=" * 70 + "\n")
    
    return failed == 0

if __name__ == '__main__':
    success = test_dual_authentication()
    sys.exit(0 if success else 1)
