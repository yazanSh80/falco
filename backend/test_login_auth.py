#!/usr/bin/env python
"""
Database Login Test Script
Tests if users in the database can authenticate properly
"""
import sys
import os

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus

def test_database_connection():
    """Test database connection."""
    app = create_app()
    
    with app.app_context():
        print("[TEST] Database Connection Test")
        print("=" * 60)
        
        try:
            # Try to query users
            user_count = User.query.count()
            print(f"[OK] Database connected. Total users: {user_count}")
            return True
        except Exception as e:
            print(f"[ERROR] Database connection failed: {e}")
            return False


def test_user_login():
    """Test if seeded users can login."""
    app = create_app()
    
    with app.app_context():
        print("\n[TEST] User Login Test")
        print("=" * 60)
        
        # Test with demo admin
        test_users = [
            {'email': 'admin@test.com', 'password': 'Pass123!', 'expected_role': 'admin'},
            {'email': 'customer1@test.com', 'password': 'Pass123!', 'expected_role': 'customer'},
            {'email': 'engineer1@test.com', 'password': 'Pass123!', 'expected_role': 'engineer'},
        ]
        
        results = []
        for test_user in test_users:
            email = test_user['email']
            password = test_user['password']
            
            # Find user in database
            user = User.query.filter_by(email=email).first()
            
            if not user:
                print(f"\n[FAIL] User not found: {email}")
                results.append(False)
                continue
            
            print(f"\n[INFO] Found user: {email}")
            print(f"       Role: {user.role}")
            print(f"       Status: {user.status}")
            print(f"       Name: {user.name}")
            
            # Test password
            password_match = user.check_password(password)
            
            if password_match:
                print(f"[OK] Password matches for {email}")
                
                # Check if user can login (status checks)
                if user.status == UserStatus.BLOCKED.value:
                    print(f"[BLOCKED] User is blocked")
                    results.append(False)
                elif user.status == UserStatus.PENDING.value and user.role != UserRole.ENGINEER.value:
                    print(f"[PENDING] User is pending approval")
                    results.append(False)
                else:
                    print(f"[SUCCESS] User can login!")
                    results.append(True)
            else:
                print(f"[FAIL] Password does not match for {email}")
                results.append(False)
        
        print("\n" + "=" * 60)
        print(f"[SUMMARY] {sum(results)}/{len(results)} users can login")
        print("=" * 60)


def verify_demo_data():
    """Verify demo data exists."""
    app = create_app()
    
    with app.app_context():
        print("\n[TEST] Demo Data Verification")
        print("=" * 60)
        
        admins = User.query.filter_by(role='admin').count()
        customers = User.query.filter_by(role='customer').count()
        engineers = User.query.filter_by(role='engineer').count()
        
        print(f"Admins: {admins}")
        print(f"Customers: {customers}")
        print(f"Engineers: {engineers}")
        print(f"Total users: {admins + customers + engineers}")
        
        # Show specific demo users
        print("\n[DEMO USERS]")
        demo_emails = [
            'ahmadsaqer818@gmail.com', 
            'admin@test.com', 
            'customer1@test.com',
            'engineer1@test.com'
        ]
        
        for email in demo_emails:
            user = User.query.filter_by(email=email).first()
            if user:
                print(f"  [{user.role.upper()}] {email} - Status: {user.status}")
            else:
                print(f"  [NOT FOUND] {email}")


if __name__ == '__main__':
    # Run all tests
    db_ok = test_database_connection()
    
    if db_ok:
        test_user_login()
        verify_demo_data()
    else:
        print("\n[FATAL] Cannot continue without database connection")
        sys.exit(1)
    
    print("\n[DONE]")
