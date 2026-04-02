"""
Database Seeding Script for FalcoElectrec
Run with: python seed.py
"""
import sys
import os
from datetime import date, timedelta

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus
from app.models.engineer_profile import EngineerProfile, SubscriptionStatus
from app.models.service import Feature, Service
from app.models.request import Request, RequestStatus, RequestType
from app.models.review import Review
from app.models.notification import Notification
from app.models.transaction import Transaction
from app.models.portfolio import PortfolioItem


def seed_database():
    """Seed the database with initial data."""
    app = create_app()
    
    with app.app_context():
        print("🌱 Starting database seeding...")
        
        # Clear existing data
        print("  Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # ==================== Features ====================
        print("  Creating features...")
        features_data = [
            {'id': 'F1', 'name': 'A/C Maintenance', 'icon': 'Wind', 'description': 'Air conditioning repair, cleaning, and installation'},
            {'id': 'F2', 'name': 'Plumbing', 'icon': 'Droplet', 'description': 'Pipe repair, faucet installation, water heater services'},
            {'id': 'F3', 'name': 'Carpentry', 'icon': 'Hammer', 'description': 'Door repair, cabinet installation, wooden furniture'},
            {'id': 'F4', 'name': 'Electricity', 'icon': 'Zap', 'description': 'Electrical repairs, outlet installation, panel maintenance'},
            {'id': 'F5', 'name': 'Alumetal', 'icon': 'Box', 'description': 'Aluminum window grills, door frames, metalwork'},
            {'id': 'F6', 'name': 'Furniture Cleaning', 'icon': 'Sparkles', 'description': 'Sofa cleaning, carpet cleaning, upholstery services'},
        ]
        
        for f_data in features_data:
            feature = Feature(**f_data)
            db.session.add(feature)
        
        # ==================== Services ====================
        print("  Creating services...")
        services_data = [
            # A/C Maintenance
            {'id': 'S1', 'feature_id': 'F1', 'name': 'AC Unit Cleaning', 'base_price': 150, 'description': 'Complete AC unit cleaning and filter replacement'},
            {'id': 'S2', 'feature_id': 'F1', 'name': 'AC Repair', 'base_price': 280, 'description': 'Diagnose and repair AC issues'},
            {'id': 'S3', 'feature_id': 'F1', 'name': 'AC Installation', 'base_price': 450, 'description': 'New AC unit installation'},
            # Plumbing
            {'id': 'S4', 'feature_id': 'F2', 'name': 'Pipe Leak Repair', 'base_price': 120, 'description': 'Fix leaking pipes and faucets'},
            {'id': 'S5', 'feature_id': 'F2', 'name': 'Toilet Repair', 'base_price': 100, 'description': 'Repair or replace toilet components'},
            {'id': 'S6', 'feature_id': 'F2', 'name': 'Water Heater Install', 'base_price': 350, 'description': 'Install new water heater'},
            # Carpentry
            {'id': 'S7', 'feature_id': 'F3', 'name': 'Door Repair', 'base_price': 180, 'description': 'Fix or replace door hinges and locks'},
            {'id': 'S8', 'feature_id': 'F3', 'name': 'Cabinet Installation', 'base_price': 400, 'description': 'Custom cabinet installation'},
            {'id': 'S9', 'feature_id': 'F3', 'name': 'Window Frame Repair', 'base_price': 200, 'description': 'Repair wooden window frames'},
            # Electricity
            {'id': 'S10', 'feature_id': 'F4', 'name': 'Lighting Repair', 'base_price': 120, 'description': 'Fix lighting issues in rooms'},
            {'id': 'S11', 'feature_id': 'F4', 'name': 'Main Panel Check', 'base_price': 250, 'description': 'Inspect and test electrical panel'},
            {'id': 'S12', 'feature_id': 'F4', 'name': 'Outlet Installation', 'base_price': 80, 'description': 'Install new electrical outlets'},
            # Alumetal
            {'id': 'S13', 'feature_id': 'F5', 'name': 'Window Grill Install', 'base_price': 320, 'description': 'Install aluminum window grills'},
            {'id': 'S14', 'feature_id': 'F5', 'name': 'Door Frame Repair', 'base_price': 190, 'description': 'Fix aluminum door frames'},
            # Furniture Cleaning
            {'id': 'S15', 'feature_id': 'F6', 'name': 'Sofa Deep Cleaning', 'base_price': 180, 'description': 'Professional sofa and upholstery cleaning'},
            {'id': 'S16', 'feature_id': 'F6', 'name': 'Carpet Cleaning', 'base_price': 150, 'description': 'Deep carpet cleaning service'},
        ]
        
        for s_data in services_data:
            service = Service(**s_data)
            db.session.add(service)
        
        db.session.commit()
        
        # ==================== Users ====================
        print("  Creating users...")
        
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
        
        # Customer
        customer = User(
            name='Ahmad Customer',
            email='customer@test.com',
            phone='0599111111',
            role=UserRole.CUSTOMER.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='City Center'
        )
        customer.set_password('Pass123!')
        db.session.add(customer)
        
        # Additional customers
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
        
        db.session.flush()  # Get IDs
        
        # Engineer (active subscription)
        engineer = User(
            name='Ahmad Engineer',
            email='engineer@test.com',
            phone='0599333333',
            role=UserRole.ENGINEER.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='City Center'
        )
        engineer.set_password('Pass123!')
        db.session.add(engineer)
        db.session.flush()
        
        engineer_profile = EngineerProfile(
            user_id=engineer.id,
            specialization='A/C Maintenance',
            years_exp=8,
            bio='Experienced AC technician with 8+ years of experience in residential and commercial systems.',
            subscription_status=SubscriptionStatus.ACTIVE.value,
            subscription_expiry=date.today() + timedelta(days=365),
            rating_avg=4.8,
            rating_count=15
        )
        db.session.add(engineer_profile)
        
        # Engineer (expired subscription)
        expired_engineer = User(
            name='Omar Expired',
            email='expired@test.com',
            phone='0599444444',
            role=UserRole.ENGINEER.value,
            status=UserStatus.ACTIVE.value,
            city='Ramallah',
            area='Downtown'
        )
        expired_engineer.set_password('Pass123!')
        db.session.add(expired_engineer)
        db.session.flush()
        
        expired_profile = EngineerProfile(
            user_id=expired_engineer.id,
            specialization='Plumbing',
            years_exp=10,
            bio='Master plumber with extensive experience in plumbing repairs.',
            subscription_status=SubscriptionStatus.EXPIRED.value,
            subscription_expiry=date.today() - timedelta(days=30),
            rating_avg=4.9,
            rating_count=25
        )
        db.session.add(expired_profile)
        
        # Pending engineer
        pending_engineer = User(
            name='Ibrahim Pending',
            email='pending@test.com',
            phone='0599555555',
            role=UserRole.ENGINEER.value,
            status=UserStatus.PENDING.value,
            city='Jenin',
            area='Central'
        )
        pending_engineer.set_password('Pass123!')
        db.session.add(pending_engineer)
        db.session.flush()
        
        pending_profile = EngineerProfile(
            user_id=pending_engineer.id,
            specialization='Electricity',
            years_exp=3,
            bio='New graduate seeking to start career in electrical services.',
            subscription_status=SubscriptionStatus.ACTIVE.value,
            subscription_expiry=date.today() + timedelta(days=30)
        )
        db.session.add(pending_profile)
        
        # More engineers
        engineers_data = [
            {'name': 'Sami Nasser', 'email': 'sami@test.com', 'specialization': 'A/C Maintenance', 'years_exp': 5, 'city': 'Bethlehem', 'area': 'Old City'},
            {'name': 'Khalid Abbas', 'email': 'khalid@test.com', 'specialization': 'Plumbing', 'years_exp': 6, 'city': 'Hebron', 'area': 'City Center'},
            {'name': 'Yusuf Tamer', 'email': 'yusuf@test.com', 'specialization': 'Carpentry', 'years_exp': 12, 'city': 'Nablus', 'area': 'Al-Balad'},
            {'name': 'Hana Mahmoud', 'email': 'hana@test.com', 'specialization': 'Electricity', 'years_exp': 9, 'city': 'Ramallah', 'area': 'Al-Masyoun'},
        ]
        
        for e_data in engineers_data:
            e_user = User(
                name=e_data['name'],
                email=e_data['email'],
                phone='0599666666',
                role=UserRole.ENGINEER.value,
                status=UserStatus.ACTIVE.value,
                city=e_data['city'],
                area=e_data['area']
            )
            e_user.set_password('Pass123!')
            db.session.add(e_user)
            db.session.flush()
            
            e_profile = EngineerProfile(
                user_id=e_user.id,
                specialization=e_data['specialization'],
                years_exp=e_data['years_exp'],
                bio=f"Professional {e_data['specialization'].lower()} technician.",
                subscription_status=SubscriptionStatus.ACTIVE.value,
                subscription_expiry=date.today() + timedelta(days=365),
                rating_avg=round(4.0 + (e_data['years_exp'] * 0.05), 1),
                rating_count=e_data['years_exp'] * 2
            )
            db.session.add(e_profile)
        
        db.session.commit()
        
        # ==================== Sample Requests ====================
        print("  Creating sample requests...")
        
        # Completed request
        req1 = Request(
            request_number='R-0001',
            customer_id=customer.id,
            service_id='S1',
            type=RequestType.LATE.value,
            category='A/C Maintenance',
            description='AC unit not cooling properly, needs inspection and cleaning.',
            location_text='123 Main St, Hebron City Center',
            status=RequestStatus.COMPLETED.value,
            engineer_id=engineer.id,
            price_at_request=150
        )
        db.session.add(req1)
        
        # Pending request
        req2 = Request(
            request_number='R-0002',
            customer_id=customer.id,
            service_id='S4',
            type=RequestType.QUICK.value,
            category='Plumbing',
            description='Leaking faucet in kitchen, need urgent repair.',
            location_text='456 Oak Ave, Hebron Wadi Al-Hariya',
            status=RequestStatus.PENDING.value,
            price_at_request=120
        )
        db.session.add(req2)
        
        # In-progress request
        req3 = Request(
            request_number='R-0003',
            customer_id=customer2.id,
            service_id='S10',
            type=RequestType.LATE.value,
            category='Electricity',
            description='Several lights not working in living room.',
            location_text='789 Church St, Bethlehem Old City',
            status=RequestStatus.ACCEPTED.value,
            engineer_id=engineer.id,
            price_at_request=120
        )
        db.session.add(req3)
        
        db.session.commit()
        
        # ==================== Reviews ====================
        print("  Creating reviews...")
        
        review1 = Review(
            request_id=req1.id,
            reviewer_id=customer.id,
            reviewee_id=engineer.id,
            rating=5,
            text='Excellent work! Very professional and thorough.'
        )
        db.session.add(review1)
        
        db.session.commit()
        
        # ==================== Transactions ====================
        print("  Creating transactions...")
        
        transaction1 = Transaction(
            request_id=req1.id,
            customer_id=customer.id,
            engineer_id=engineer.id,
            gross_amount=150,
            commission_rate=0.0,
            commission_amount=0.0,
            net_amount=150
        )
        db.session.add(transaction1)
        
        db.session.commit()
        
        # ==================== Notifications ====================
        print("  Creating notifications...")
        
        Notification.create_notification(
            user_id=customer.id,
            type='request_completed',
            title='Request Completed',
            body='Your AC maintenance request has been completed.'
        )
        
        Notification.create_notification(
            user_id=engineer.id,
            type='review_received',
            title='New Review',
            body='Ahmad gave you a 5-star rating!'
        )
        
        Notification.create_notification(
            user_id=pending_engineer.id,
            type='general',
            title='Welcome to FalcoElectrec',
            body='Your account is pending approval. We will notify you once approved.'
        )
        
        db.session.commit()
        
        # ==================== Portfolio Items ====================
        print("  Creating portfolio items...")
        
        portfolio1 = PortfolioItem(
            engineer_id=engineer.id,
            title='Complete Home AC System',
            description='Installed and configured 5 AC units in a new residential building.',
            location='Hebron'
        )
        db.session.add(portfolio1)
        
        portfolio2 = PortfolioItem(
            engineer_id=engineer.id,
            title='Commercial AC Maintenance',
            description='Regular maintenance contract for office building.',
            location='Ramallah'
        )
        db.session.add(portfolio2)
        
        db.session.commit()
        
        print("\n✅ Database seeding completed!")
        print("\n📋 Demo Accounts:")
        print("   Customer:  customer@test.com / Pass123!")
        print("   Engineer:  engineer@test.com / Pass123! (active)")
        print("   Expired:   expired@test.com / Pass123! (subscription expired)")
        print("   Pending:   pending@test.com / Pass123! (awaiting approval)")
        print("   Admin:     admin@test.com / Pass123!")


if __name__ == '__main__':
    seed_database()
