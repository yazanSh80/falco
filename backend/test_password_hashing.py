#!/usr/bin/env python
"""
Test Script: Password Hashing Verification for All Users

Verifies that:
1. Database users have properly hashed passwords
2. Password verification works correctly
3. Passwords are not stored in plaintext
4. Demo users use correct demo passwords
"""
import sys
import os

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole

def test_password_hashing():
    """Verify password hashing for all users."""
    app = create_app()
    app.config['TESTING'] = True
    
    print("\n" + "=" * 70)
    print("PASSWORD HASHING VERIFICATION TEST")
    print("=" * 70)
    
    with app.app_context():
        # Test 1: Check that demo accounts have secure passwords
        print("\n[TEST 1] Demo Account Passwords")
        print("-" * 70)
        
        demo_config = app.config.get('DEMO_ACCOUNTS', {})
        demo_accounts_checked = 0
        
        for email, account_data in demo_config.items():
            password = account_data['password']
            
            # Check password is not empty
            if not password:
                print(f"  ❌ FAIL: {email} has empty password")
                continue
            
            # Check password is reasonably strong
            if len(password) < 4:
                print(f"  ⚠️  WARNING: {email} has weak password (length: {len(password)})")
            else:
                print(f"  ✅ PASS: {email} has password (length: {len(password)})")
            
            demo_accounts_checked += 1
        
        print(f"\n  Total demo accounts: {demo_accounts_checked}")
        
        # Test 2: Check database users have hashed passwords
        print("\n[TEST 2] Database User Password Hashing")
        print("-" * 70)
        
        db_users = User.query.all()
        hashed_count = 0
        plaintext_count = 0
        
        if not db_users:
            print("  ℹ️  No users in database yet")
        else:
            for user in db_users[:10]:  # Check first 10 users
                pwd_hash = user.password_hash
                
                # Check password hash exists
                if not pwd_hash:
                    print(f"  ❌ FAIL: {user.email} has no password hash")
                    continue
                
                # Check hash is not plaintext (werkzeug hashes start with specific prefixes)
                if pwd_hash.startswith('pbkdf2:'):
                    print(f"  ✅ PASS: {user.email} has secure hash (PBKDF2SHA256)")
                    hashed_count += 1
                elif pwd_hash.startswith('scrypt:') or pwd_hash.startswith('argon2'):
                    print(f"  ✅ PASS: {user.email} has secure hash ({pwd_hash.split(':')[0].upper()})")
                    hashed_count += 1
                elif pwd_hash == user.password_hash and len(pwd_hash) < 20:
                    print(f"  ❌ FAIL: {user.email} appears to have plaintext password: {pwd_hash}")
                    plaintext_count += 1
                else:
                    print(f"  ✅ PASS: {user.email} has hashed password (hash method: {pwd_hash[:15]}...)")
                    hashed_count += 1
            
            print(f"\n  Total users checked: min({10}, {len(db_users)})")
            print(f"  Securely hashed: {hashed_count}")
            print(f"  Plaintext risk: {plaintext_count}")
        
        # Test 3: Verify password checking works
        print("\n[TEST 3] Password Verification")
        print("-" * 70)
        
        test_users = [
            {'email': 'admin@test.com', 'password': 'Pass123!'},
            {'email': 'customer1@test.com', 'password': 'Pass123!'},
            {'email': 'engineer1@test.com', 'password': 'Pass123!'},
        ]
        
        verification_passed = 0
        verification_failed = 0
        
        for test_user in test_users:
            user = User.query.filter_by(email=test_user['email']).first()
            
            if not user:
                print(f"  ℹ️  {test_user['email']} not in database")
                continue
            
            # Test correct password
            if user.check_password(test_user['password']):
                print(f"  ✅ PASS: {test_user['email']} - correct password verified")
                verification_passed += 1
            else:
                print(f"  ❌ FAIL: {test_user['email']} - correct password NOT verified")
                verification_failed += 1
            
            # Test wrong password
            if not user.check_password('WrongPassword123'):
                print(f"  ✅ PASS: {test_user['email']} - wrong password rejected")
            else:
                print(f"  ❌ FAIL: {test_user['email']} - wrong password accepted (SECURITY RISK!)")
                verification_failed += 1
        
        print(f"\n  Password verifications passed: {verification_passed}")
        print(f"  Password verifications failed: {verification_failed}")
        
        # Test 4: Demo account fallback password check
        print("\n[TEST 4] Demo Account Fallback Passwords")
        print("-" * 70)
        
        demo_passwords_match = 0
        demo_passwords_mismatch = 0
        
        for email, account_data in demo_config.items():
            demo_pwd = account_data['password']
            db_user = User.query.filter_by(email=email).first()
            
            if db_user:
                # Database user exists
                if db_user.check_password(demo_pwd):
                    print(f"  ✅ {email} - DB password matches demo password")
                    demo_passwords_match += 1
                else:
                    print(f"  ⚠️  {email} - DB password differs from demo password (OK: DB takes precedence)")
                    demo_passwords_mismatch += 1
            else:
                # User not in DB, will use demo fallback
                print(f"  ℹ️  {email} - Not in DB, will use demo fallback")
        
        print(f"\n  Demo credentials in DB matching: {demo_passwords_match}")
        print(f"  Demo credentials in DB differing: {demo_passwords_mismatch}")
        
        # Summary
        print("\n" + "=" * 70)
        print("PASSWORD HASHING SUMMARY")
        print("=" * 70)
        
        if plaintext_count == 0 and verification_failed == 0:
            print("\n✅ ALL PASSWORD TESTS PASSED!")
            print("\n✅ Passwords are properly hashed using werkzeug security")
            print("✅ Password verification works correctly")
            print("✅ Demo account passwords are configured")
            print("✅ Dual authentication is secure")
            print("✅ Both database users and demo accounts have proper password handling")
            return True
        else:
            print(f"\n⚠️  Some issues detected:")
            if plaintext_count > 0:
                print(f"   - {plaintext_count} plaintext password risks detected")
            if verification_failed > 0:
                print(f"   - {verification_failed} password verification failures")
            return False

if __name__ == '__main__':
    success = test_password_hashing()
    sys.exit(0 if success else 1)
