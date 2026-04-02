#!/usr/bin/env python
"""Quick seeding script - Creates basic test accounts"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus
from app.models.engineer_profile import EngineerProfile, SubscriptionStatus
from datetime import date, timedelta

def quick_seed():
    app = create_app()
    
    with app.app_context():
        # Clear all data
        print("🗑️  Clearing database...")
        db.drop_all()
        db.create_all()
        
        print("👤 Creating test accounts...\n")
        
        # Admin
        admin = User(
            name='Admin User',
            email='admin@test.com',
            phone='0599000000',
            role=UserRole.ADMIN.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='City Center'
        )
        admin.set_password('Pass123!')
        db.session.add(admin)
        print("✓ Admin: admin@test.com / Pass123!")
        
        # Customer 1
        customer1 = User(
            name='Ahmad Customer',
            email='customer@test.com',
            phone='0599111111',
            role=UserRole.CUSTOMER.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='City Center'
        )
        customer1.set_password('Pass123!')
        db.session.add(customer1)
        print("✓ Customer: customer@test.com / Pass123!")
        
        # Customer 2
        customer2 = User(
            name='Sara Customer',
            email='sara@test.com',
            phone='0599222222',
            role=UserRole.CUSTOMER.value,
            status=UserStatus.ACTIVE.value,
            city='Bethlehem',
            area='Old City'
        )
        customer2.set_password('Pass123!')
        db.session.add(customer2)
        print("✓ Customer: sara@test.com / Pass123!")
        
        # Save customers to get IDs
        db.session.flush()
        
        # Engineer 1 (Active)
        engineer1 = User(
            name='Ahmad Engineer',
            email='engineer@test.com',
            phone='0599333333',
            role=UserRole.ENGINEER.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='City Center'
        )
        engineer1.set_password('Pass123!')
        db.session.add(engineer1)
        db.session.flush()
        
        engineer1_profile = EngineerProfile(
            user_id=engineer1.id,
            specialization='A/C Maintenance',
            years_exp=8,
            bio='Experienced AC technician with 8+ years of experience.',
            subscription_status=SubscriptionStatus.ACTIVE.value,
            subscription_expiry=date.today() + timedelta(days=365),
            rating_avg=4.8,
            rating_count=15
        )
        db.session.add(engineer1_profile)
        print("✓ Engineer: engineer@test.com / Pass123!")
        
        # Engineer 2 (Pending)
        engineer2 = User(
            name='Omar Engineer',
            email='engineer2@test.com',
            phone='0599444444',
            role=UserRole.ENGINEER.value,
            status=UserStatus.PENDING.value,
            city='Ramallah',
            area='Downtown'
        )
        engineer2.set_password('Pass123!')
        db.session.add(engineer2)
        db.session.flush()
        
        engineer2_profile = EngineerProfile(
            user_id=engineer2.id,
            specialization='Plumbing',
            years_exp=5,
            bio='Plumber with 5 years of experience.',
            subscription_status=SubscriptionStatus.ACTIVE.value,
            subscription_expiry=date.today() + timedelta(days=30),
            rating_avg=4.5,
            rating_count=8
        )
        db.session.add(engineer2_profile)
        print("✓ Engineer: engineer2@test.com / Pass123!")
        
        # Engineer 3 (Expired Subscription)
        engineer3 = User(
            name='Khalid Engineer',
            email='engineer3@test.com',
            phone='0599555555',
            role=UserRole.ENGINEER.value,
            status=UserStatus.ACTIVE.value,
            city='Jenin',
            area='Central'
        )
        engineer3.set_password('Pass123!')
        db.session.add(engineer3)
        db.session.flush()
        
        engineer3_profile = EngineerProfile(
            user_id=engineer3.id,
            specialization='Electricity',
            years_exp=3,
            bio='Electrician with 3 years experience.',
            subscription_status=SubscriptionStatus.EXPIRED.value,
            subscription_expiry=date.today() - timedelta(days=30),
            rating_avg=4.2,
            rating_count=5
        )
        db.session.add(engineer3_profile)
        print("✓ Engineer: engineer3@test.com / Pass123!")
        
        # Commit all
        db.session.commit()
        
        print("\n" + "="*50)
        print("✅ Database seeded successfully!")
        print("="*50)
        print("\n📱 Open: http://localhost:5173")
        print("\n🔑 Test Accounts:")
        print("   Admin: admin@test.com / Pass123!")
        print("   Customer: customer@test.com / Pass123!")
        print("   Engineer: engineer@test.com / Pass123!")
        print()

if __name__ == '__main__':
    quick_seed()
