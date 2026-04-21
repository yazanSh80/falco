"""
Enhanced Demo Seeding Script for FalcoElectrec
Creates realistic demo data for graduation project presentation

Run with: python seed_demo.py

Features:
- 30+ requests in various states (pending, accepted, in-progress, completed, cancelled)
- SLA breach scenarios (at-risk, breached)
- Multiple engineers with varied ratings and specializations
- Financial transactions spanning 6 months
- Disputes and resolutions
- Notifications timeline
- Admin audit trail
- Blocked users for block list demonstration
"""
import sys
import os
import random
from datetime import date, datetime, timedelta

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
from app.models.block import Block
from app.models.dispute import Dispute, DisputeStatus

# Try to import AdminActionLog if available
try:
    from app.models.admin_action_log import AdminActionLog
    HAS_AUDIT_LOG = True
except ImportError:
    HAS_AUDIT_LOG = False


# Palestinian cities and areas for realistic addresses
LOCATIONS = [
    {'city': 'Hebron', 'areas': ['City Center', 'Wadi Al-Hariya', 'Ein Sara', 'Jabal Al-Rahma', 'Ras Al-Joura']},
    {'city': 'Bethlehem', 'areas': ['Old City', 'Beit Sahour', 'Beit Jala', 'Al-Doha', 'Aideh Camp']},
    {'city': 'Ramallah', 'areas': ['Al-Masyoun', 'Downtown', 'Al-Bireh', 'Al-Tireh', 'Ein Misbah']},
    {'city': 'Nablus', 'areas': ['Al-Balad', 'Rafidia', 'Tell', 'Askar Camp', 'Balata']},
    {'city': 'Jenin', 'areas': ['Central', 'Jenin Camp', 'Al-Salam', 'Al-Nasra', 'Al-Hawz']},
    {'city': 'Jericho', 'areas': ['City Center', 'Aqbat Jaber', 'Ein Al-Sultan', 'Al-Dyouk']},
    {'city': 'Tulkarm', 'areas': ['City Center', 'Irtah', 'Nur Shams', 'Tulkarm Camp']},
]

# Arabic/Palestinian first names
FIRST_NAMES = ['Ahmad', 'Mohammad', 'Mahmoud', 'Yusuf', 'Omar', 'Khaled', 'Sami', 'Ibrahim', 'Tariq', 'Rami',
               'Sara', 'Layla', 'Hana', 'Noor', 'Fatima', 'Amal', 'Mona', 'Rania', 'Dina', 'Lina']

LAST_NAMES = ['Nasser', 'Abbas', 'Hassan', 'Ali', 'Khalil', 'Saleh', 'Yousef', 'Mahmoud', 'Jabari', 'Tamimi',
              'Barghouti', 'Qasem', 'Haddad', 'Khoury', 'Issa', 'Saad', 'Odeh', 'Natsheh', 'Dweik', 'Amro']

# Request descriptions by category
REQUEST_DESCRIPTIONS = {
    'A/C Maintenance': [
        'AC unit making strange noise, needs inspection.',
        'Air conditioning not cooling properly, very hot inside.',
        'Split AC water leaking inside the room.',
        'AC remote not working, unit not responding.',
        'Need regular AC maintenance before summer.',
        'AC compressor issue, not starting at all.',
    ],
    'Plumbing': [
        'Kitchen sink leaking, water everywhere.',
        'Toilet running continuously, wasting water.',
        'Hot water heater not heating, cold showers.',
        'Bathroom faucet dripping all day.',
        'Blocked drain in kitchen, water backing up.',
        'Need to install new shower head.',
    ],
    'Carpentry': [
        'Bedroom door hinges broken, door falling.',
        'Kitchen cabinet door needs replacement.',
        'Window frame damaged, letting cold air in.',
        'Need custom shelves for living room.',
        'Wardrobe door not closing properly.',
        'Wooden floor boards creaking loudly.',
    ],
    'Electricity': [
        'Living room lights flickering constantly.',
        'Power outlet not working in bedroom.',
        'Circuit breaker keeps tripping.',
        'Need to install ceiling fan.',
        'Doorbell stopped working.',
        'Want to add more outlets in kitchen.',
    ],
    'Alumetal': [
        'Aluminum window frame bent, won\'t close.',
        'Need security grills for ground floor windows.',
        'Balcony railing loose, safety concern.',
        'Sliding door track damaged.',
        'Kitchen window glass cracked, needs replacement.',
    ],
    'Furniture Cleaning': [
        'Living room sofa needs deep cleaning.',
        'Carpets dusty and stained, full house.',
        'Office chairs need professional cleaning.',
        'Mattresses need sanitizing.',
        'Curtains dusty, need cleaning service.',
    ],
}


def random_date_between(start_days_ago, end_days_ago):
    """Generate a random datetime between two days ago ranges."""
    start_date = datetime.now() - timedelta(days=start_days_ago)
    end_date = datetime.now() - timedelta(days=end_days_ago)
    time_diff = end_date - start_date
    random_seconds = random.randint(0, int(time_diff.total_seconds()))
    return start_date + timedelta(seconds=random_seconds)


def get_random_location():
    """Get a random city and area."""
    loc = random.choice(LOCATIONS)
    return loc['city'], random.choice(loc['areas'])


def seed_demo_database():
    """Seed the database with comprehensive demo data."""
    app = create_app()
    
    with app.app_context():
        print("[STARTING] DEMO database seeding...")
        print("   This creates comprehensive data for graduation presentation.\n")
        
        # Clear existing data
        print("  [CLEAR] Clearing existing data...")
        # db.drop_all()
        # db.create_all()
        
        # ==================== Features ====================
        print("  [FEATURES] Creating features...")
        features_data = [
            {'id': 'F1', 'name': 'A/C Maintenance', 'icon': 'Wind', 'description': 'Air conditioning repair, cleaning, and installation'},
            {'id': 'F2', 'name': 'Plumbing', 'icon': 'Droplet', 'description': 'Pipe repair, faucet installation, water heater services'},
            {'id': 'F3', 'name': 'Carpentry', 'icon': 'Hammer', 'description': 'Door repair, cabinet installation, wooden furniture'},
            {'id': 'F4', 'name': 'Electricity', 'icon': 'Zap', 'description': 'Electrical repairs, outlet installation, panel maintenance'},
            {'id': 'F5', 'name': 'Alumetal', 'icon': 'Box', 'description': 'Aluminum window grills, door frames, metalwork'},
            {'id': 'F6', 'name': 'Furniture Cleaning', 'icon': 'Sparkles', 'description': 'Sofa cleaning, carpet cleaning, upholstery services'},
        ]
        
        for f_data in features_data:
            db.session.add(Feature(**f_data))
        
        # ==================== Services ====================
        print("  [SERVICES] Creating services...")
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
        
        services_by_feature = {}
        for s_data in services_data:
            service = Service(**s_data)
            db.session.add(service)
            feature_id = s_data['feature_id']
            if feature_id not in services_by_feature:
                services_by_feature[feature_id] = []
            services_by_feature[feature_id].append(s_data['id'])
        
        feature_to_category = {
            'F1': 'A/C Maintenance',
            'F2': 'Plumbing',
            'F3': 'Carpentry',
            'F4': 'Electricity',
            'F5': 'Alumetal',
            'F6': 'Furniture Cleaning',
        }
        
        db.session.commit()
        
        # ==================== Admins ====================
        print("  [ADMINS] Creating admins...")
        
        # Demo Super Admin (Ahmad SAQER - Project Lead)
        # Email: ahmadsaqer818@gmail.com | Password: saqer123
        super_admin = User(
            name='Ahmad Saqer',
            email='ahmadsaqer818@gmail.com',
            phone='0599000999',
            role=UserRole.ADMIN.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='City Center'
        )
        super_admin.set_password('saqer123')  # Demo password as requested
        db.session.add(super_admin)
        print("    [OK] Super Admin: ahmadsaqer818@gmail.com / saqer123")
        
        admin = User(
            name='Admin Ahmad',
            email='admin@test.com',
            phone='0599000000',
            role=UserRole.ADMIN.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='City Center'
        )
        admin.set_password('Pass123!')
        db.session.add(admin)
        
        admin2 = User(
            name='Admin Sara',
            email='admin2@test.com',
            phone='0599000001',
            role=UserRole.ADMIN.value,
            status=UserStatus.ACTIVE.value,
            city='Ramallah',
            area='Al-Masyoun'
        )
        admin2.set_password('Pass123!')
        db.session.add(admin2)
        
        db.session.flush()
        
        # ==================== Standard Demo Accounts (For Quick Testing) ====================
        print("  [DEMO ACCOUNTS] Creating standard demo accounts...")
        
        # Demo Customer
        demo_customer = User(
            name='Test Customer',
            email='customer@test.com',
            phone='0599000001',
            role=UserRole.CUSTOMER.value,
            status=UserStatus.ACTIVE.value,
            city='Ramallah',
            area='Al-Masyoun'
        )
        demo_customer.set_password('Pass123!')
        db.session.add(demo_customer)
        print("    [OK] Demo Customer: customer@test.com / Pass123!")
        
        # Demo Engineer (Active/Approved)
        demo_engineer = User(
            name='Test Engineer',
            email='engineer@test.com',
            phone='0599000002',
            role=UserRole.ENGINEER.value,
            status=UserStatus.ACTIVE.value,
            city='Hebron',
            area='H1'
        )
        demo_engineer.set_password('Pass123!')
        db.session.add(demo_engineer)
        db.session.flush()
        print("    [OK] Demo Engineer: engineer@test.com / Pass123!")
        
        # Demo Engineer Profile (for active engineer)
        demo_engineer_profile = EngineerProfile(
            user_id=demo_engineer.id,
            specialization='General',
            years_exp=5,
            bio='Demo engineer for testing purposes',
            subscription_status=SubscriptionStatus.ACTIVE.value,
            subscription_expiry=date.today() + timedelta(days=365)
        )
        db.session.add(demo_engineer_profile)
        
        # Demo Engineer (Pending Approval)
        demo_engineer_pending = User(
            name='Pending Engineer',
            email='engineer.pending@test.com',
            phone='0599000003',
            role=UserRole.ENGINEER.value,
            status=UserStatus.PENDING.value,
            city='Nablus',
            area='Old City'
        )
        demo_engineer_pending.set_password('Pass123!')
        db.session.add(demo_engineer_pending)
        db.session.flush()
        print("    [OK] Demo Engineer (Pending): engineer.pending@test.com / Pass123!")
        
        # Demo Engineer Profile (for pending engineer)
        demo_engineer_pending_profile = EngineerProfile(
            user_id=demo_engineer_pending.id,
            specialization='Electrical',
            years_exp=3,
            bio='Demo engineer pending approval for testing purposes',
            subscription_status=SubscriptionStatus.ACTIVE.value,
            subscription_expiry=date.today() + timedelta(days=30)
        )
        db.session.add(demo_engineer_pending_profile)
        
        # Demo Admin (Alternative)
        demo_admin_alt = User(
            name='Super Admin',
            email='admin@falco.local',
            phone='0599000004',
            role=UserRole.ADMIN.value,
            status=UserStatus.ACTIVE.value,
            city='Ramallah',
            area='Shaar'
        )
        demo_admin_alt.set_password('Admin@12345')
        db.session.add(demo_admin_alt)
        print("    [OK] Demo Admin (Alt): admin@falco.local / Admin@12345")
        
        db.session.commit()
        
        # ==================== Customers ====================
        print("  [CUSTOMERS] Creating customers (15)...")
        
        customers = []
        for i in range(15):
            city, area = get_random_location()
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            
            customer = User(
                name=f'{first_name} {last_name}',
                email=f'customer{i+1}@test.com',
                phone=f'059{random.randint(1000000, 9999999)}',
                role=UserRole.CUSTOMER.value,
                status=UserStatus.ACTIVE.value if i < 13 else UserStatus.BLOCKED.value,
                city=city,
                area=area
            )
            customer.set_password('Pass123!')
            db.session.add(customer)
            customers.append(customer)
        
        db.session.flush()
        
        # ==================== Engineers ====================
        print("  [ENGINEERS] Creating engineers (12)...")
        
        specializations = ['A/C Maintenance', 'Plumbing', 'Carpentry', 'Electricity', 'Alumetal', 'Furniture Cleaning']
        
        engineers = []
        engineer_profiles = []
        
        engineer_data = [
            {'name': 'Ahmad Nasser', 'specialization': 'A/C Maintenance', 'years_exp': 8, 'rating': 4.8, 'rating_count': 45, 'status': 'active'},
            {'name': 'Khalid Abbas', 'specialization': 'Plumbing', 'years_exp': 12, 'rating': 4.9, 'rating_count': 72, 'status': 'active'},
            {'name': 'Sami Saleh', 'specialization': 'Electricity', 'years_exp': 6, 'rating': 4.5, 'rating_count': 28, 'status': 'active'},
            {'name': 'Yusuf Tamimi', 'specialization': 'Carpentry', 'years_exp': 15, 'rating': 4.7, 'rating_count': 95, 'status': 'active'},
            {'name': 'Omar Mahmoud', 'specialization': 'A/C Maintenance', 'years_exp': 4, 'rating': 4.2, 'rating_count': 15, 'status': 'active'},
            {'name': 'Hana Khoury', 'specialization': 'Furniture Cleaning', 'years_exp': 5, 'rating': 4.6, 'rating_count': 35, 'status': 'active'},
            {'name': 'Ibrahim Jabari', 'specialization': 'Alumetal', 'years_exp': 10, 'rating': 4.4, 'rating_count': 52, 'status': 'active'},
            {'name': 'Rami Barghouti', 'specialization': 'Plumbing', 'years_exp': 7, 'rating': 4.3, 'rating_count': 38, 'status': 'active'},
            {'name': 'Tariq Hassan', 'specialization': 'Electricity', 'years_exp': 3, 'rating': 4.1, 'rating_count': 12, 'status': 'expired'},
            {'name': 'Mohammad Issa', 'specialization': 'Carpentry', 'years_exp': 9, 'rating': 4.6, 'rating_count': 48, 'status': 'active'},
            {'name': 'Amal Saad', 'specialization': 'Furniture Cleaning', 'years_exp': 4, 'rating': 4.5, 'rating_count': 25, 'status': 'pending'},
            {'name': 'Noor Odeh', 'specialization': 'A/C Maintenance', 'years_exp': 2, 'rating': 0, 'rating_count': 0, 'status': 'pending'},
        ]
        
        for i, e_data in enumerate(engineer_data):
            city, area = get_random_location()
            
            engineer = User(
                name=e_data['name'],
                email=f'engineer{i+1}@test.com',
                phone=f'059{random.randint(1000000, 9999999)}',
                role=UserRole.ENGINEER.value,
                status=UserStatus.ACTIVE.value if e_data['status'] != 'pending' else UserStatus.PENDING.value,
                city=city,
                area=area
            )
            engineer.set_password('Pass123!')
            db.session.add(engineer)
            db.session.flush()
            
            if e_data['status'] == 'expired':
                sub_status = SubscriptionStatus.EXPIRED.value
                sub_expiry = date.today() - timedelta(days=random.randint(10, 60))
            elif e_data['status'] == 'pending':
                sub_status = SubscriptionStatus.ACTIVE.value
                sub_expiry = date.today() + timedelta(days=30)
            else:
                sub_status = SubscriptionStatus.ACTIVE.value
                sub_expiry = date.today() + timedelta(days=random.randint(30, 365))
            
            profile = EngineerProfile(
                user_id=engineer.id,
                specialization=e_data['specialization'],
                years_exp=e_data['years_exp'],
                bio=f"Professional {e_data['specialization'].lower()} technician with {e_data['years_exp']} years of experience serving the West Bank region.",
                subscription_status=sub_status,
                subscription_expiry=sub_expiry,
                rating_avg=e_data['rating'],
                rating_count=e_data['rating_count']
            )
            db.session.add(profile)
            
            engineers.append(engineer)
            engineer_profiles.append(profile)
        
        db.session.commit()
        
        # Filter active engineers (with active subscription)
        active_engineers = [e for i, e in enumerate(engineers) if engineer_data[i]['status'] == 'active']
        
        # ==================== Requests ====================
        print("  [REQUESTS] Creating requests (35)...")
        
        requests = []
        request_counter = 1
        
        # Status distribution: completed(18), accepted(5), in_progress(4), pending(5), cancelled(3)
        status_distribution = (
            [RequestStatus.COMPLETED] * 18 +
            [RequestStatus.ACCEPTED] * 5 +
            [RequestStatus.IN_PROGRESS] * 4 +
            [RequestStatus.PENDING] * 5 +
            [RequestStatus.CANCELLED] * 3
        )
        random.shuffle(status_distribution)
        
        for status in status_distribution:
            customer = random.choice(customers[:13])  # Avoid suspended customers
            feature_id = random.choice(list(services_by_feature.keys()))
            service_id = random.choice(services_by_feature[feature_id])
            category = feature_to_category[feature_id]
            
            # Get service price
            service = Service.query.get(service_id)
            price = service.base_price if service else 150
            
            req_type = random.choice([RequestType.QUICK, RequestType.LATE])
            description = random.choice(REQUEST_DESCRIPTIONS[category])
            
            city, area = customer.city, customer.area
            location_text = f'{random.randint(1, 500)} {random.choice(["Main St", "Oak Ave", "Olive St", "Jerusalem Rd", "Al-Sahel St"])}, {city} {area}'
            
            # Set dates based on status
            if status == RequestStatus.COMPLETED:
                created_at = random_date_between(180, 7)
                completed_at = created_at + timedelta(hours=random.randint(4, 72))
                engineer = random.choice(active_engineers)
            elif status in [RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS]:
                created_at = random_date_between(7, 1)
                completed_at = None
                engineer = random.choice(active_engineers)
            elif status == RequestStatus.CANCELLED:
                created_at = random_date_between(90, 14)
                completed_at = None
                engineer = None
            else:  # PENDING
                created_at = random_date_between(3, 0)
                completed_at = None
                engineer = None
            
            req = Request(
                request_number=f'R-{request_counter:04d}',
                customer_id=customer.id,
                service_id=service_id,
                type=req_type.value,
                category=category,
                description=description,
                location_text=location_text,
                status=status.value,
                engineer_id=engineer.id if engineer else None,
                price_at_request=price,
                created_at=created_at,
                completed_at=completed_at
            )
            
            # Set SLA deadlines for newer requests
            if status in [RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS]:
                if req_type == RequestType.QUICK:
                    req.sla_response_deadline = created_at + timedelta(hours=2)
                    req.sla_completion_deadline = created_at + timedelta(hours=24)
                else:
                    req.sla_response_deadline = created_at + timedelta(hours=24)
                    req.sla_completion_deadline = created_at + timedelta(hours=72)
                
                # Simulate some SLA breaches
                if random.random() < 0.2:  # 20% breach rate
                    req.sla_response_breached = True
                if random.random() < 0.1:  # 10% completion breach
                    req.sla_completion_breached = True
            
            db.session.add(req)
            requests.append(req)
            request_counter += 1
        
        db.session.commit()
        
        # ==================== Reviews ====================
        print("  [REVIEWS] Creating reviews (25)...")
        
        completed_requests = [r for r in requests if r.status == RequestStatus.COMPLETED.value]
        
        review_texts = [
            "Excellent work! Very professional and arrived on time.",
            "Great service, would recommend to anyone.",
            "Fixed the problem quickly. Very satisfied.",
            "Good work but could communicate better.",
            "Professional and courteous. Will use again.",
            "Did a thorough job, very happy with results.",
            "Average service, got the job done.",
            "Outstanding! Went above and beyond.",
            "Reliable and trustworthy technician.",
            "Quick response and efficient work.",
            "Very knowledgeable and helpful.",
            "Fair price and quality work.",
        ]
        
        for req in completed_requests[:25]:
            rating = random.choices([5, 4, 5, 4, 3, 5], weights=[30, 25, 20, 15, 5, 5])[0]
            
            review = Review(
                request_id=req.id,
                reviewer_id=req.customer_id,
                reviewee_id=req.engineer_id,
                rating=rating,
                text=random.choice(review_texts)
            )
            db.session.add(review)
        
        db.session.commit()
        
        # ==================== Transactions ====================
        print("  [TRANSACTIONS] Creating transactions (18)...")
        
        for req in completed_requests:
            commission_rate = 0.15  # 15% commission
            gross = req.price_at_request
            commission = gross * commission_rate
            net = gross - commission
            
            transaction = Transaction(
                request_id=req.id,
                customer_id=req.customer_id,
                engineer_id=req.engineer_id,
                gross_amount=gross,
                commission_rate=commission_rate,
                commission_amount=commission,
                net_amount=net
            )
            db.session.add(transaction)
        
        db.session.commit()
        
        # ==================== Disputes ====================
        print("  [DISPUTES] Creating disputes (5)...")
        
        dispute_reasons = [
            "Engineer arrived 2 hours late without notice.",
            "Work was not completed as described.",
            "Price charged was different from quoted amount.",
            "Quality of work was substandard.",
            "Engineer was unprofessional in communication.",
        ]
        
        for i in range(5):
            req = random.choice(completed_requests)
            status = random.choice([DisputeStatus.OPEN, DisputeStatus.RESOLVED, DisputeStatus.REJECTED])
            
            dispute = Dispute(
                request_id=req.id,
                created_by=req.customer_id,
                against_user_id=req.engineer_id,
                category='quality',
                description=dispute_reasons[i],
                status=status.value
            )
            
            if status != DisputeStatus.OPEN:
                dispute.resolved_by = admin.id
                dispute.resolution_notes = "Issue reviewed and addressed according to platform policy."
                dispute.resolved_at = datetime.now() - timedelta(days=random.randint(1, 30))
            
            db.session.add(dispute)
        
        db.session.commit()
        
        # ==================== Blocks ====================
        print("  [BLOCKS] Creating blocks (4)...")
        
        # Some customers blocking engineers
        for i in range(4):
            blocker = random.choice(customers[:10])
            blocked = random.choice(engineers)
            if blocker.id != blocked.id:
                block = Block(
                    blocker_id=blocker.id,
                    blocked_id=blocked.id,
                    reason="Previous negative experience" if i % 2 == 0 else None
                )
                db.session.add(block)
        
        db.session.commit()
        
        # ==================== Portfolio Items ====================
        print("  [PORTFOLIO] Creating portfolio items (20)...")
        
        portfolio_titles = {
            'A/C Maintenance': ['Complete Home AC System', 'Commercial AC Installation', 'AC Repair Project', 'Central AC Maintenance'],
            'Plumbing': ['Bathroom Renovation', 'Kitchen Plumbing Update', 'Water Heater Installation', 'Pipe Replacement'],
            'Carpentry': ['Custom Kitchen Cabinets', 'Door Installation Project', 'Built-in Wardrobe', 'Office Furniture'],
            'Electricity': ['Home Rewiring Project', 'Smart Home Installation', 'Panel Upgrade', 'Outdoor Lighting'],
            'Alumetal': ['Security Window Grills', 'Balcony Railing Project', 'Custom Door Frames', 'Storefront Aluminum'],
            'Furniture Cleaning': ['Full House Deep Clean', 'Office Furniture Cleaning', 'Hotel Room Cleaning', 'Restaurant Cleaning'],
        }
        
        for engineer, profile in zip(engineers, engineer_profiles):
            if profile.subscription_status == SubscriptionStatus.ACTIVE.value:
                spec = profile.specialization
                titles = portfolio_titles.get(spec, ['General Project'])
                
                for j in range(random.randint(2, 4)):
                    city, _ = get_random_location()
                    portfolio = PortfolioItem(
                        engineer_id=engineer.id,
                        title=random.choice(titles),
                        description=f"Completed {spec.lower()} project with excellent results. Client very satisfied.",
                        location=city
                    )
                    db.session.add(portfolio)
        
        db.session.commit()
        
        # ==================== Notifications ====================
        print("  [NOTIFICATIONS] Creating notifications (30)...")
        
        notification_templates = [
            {'type': 'request_completed', 'title': 'Request Completed', 'body': 'Your service request has been completed.'},
            {'type': 'review_received', 'title': 'New Review', 'body': 'You received a new rating from a customer.'},
            {'type': 'new_request', 'title': 'New Request Available', 'body': 'A new request matching your skills is available.'},
            {'type': 'request_accepted', 'title': 'Request Accepted', 'body': 'An engineer has accepted your request.'},
            {'type': 'payment_received', 'title': 'Payment Received', 'body': 'Your payment has been processed successfully.'},
            {'type': 'subscription_expiring', 'title': 'Subscription Reminder', 'body': 'Your subscription will expire in 7 days.'},
        ]
        
        all_users = customers + engineers
        for _ in range(30):
            user = random.choice(all_users)
            template = random.choice(notification_templates)
            Notification.create_notification(
                user_id=user.id,
                type=template['type'],
                title=template['title'],
                body=template['body']
            )
        
        db.session.commit()
        
        # ==================== Admin Audit Log ====================
        if HAS_AUDIT_LOG:
            print("  [AUDIT] Creating admin audit log entries (20)...")
            
            actions = [
                {'action_type': 'approve_engineer', 'target_type': 'user', 'details': 'Approved engineer registration'},
                {'action_type': 'block_user', 'target_type': 'user', 'details': 'Blocked user for policy violation'},
                {'action_type': 'resolve_dispute', 'target_type': 'dispute', 'details': 'Resolved dispute in favor of customer'},
                {'action_type': 'export_engineers', 'target_type': 'report', 'details': 'Exported engineers CSV report'},
                {'action_type': 'modify_service', 'target_type': 'service', 'details': 'Updated service pricing'},
            ]
            
            for _ in range(20):
                action_data = random.choice(actions)
                log_entry = AdminActionLog(
                    admin_id=random.choice([admin.id, admin2.id]),
                    action_type=action_data['action_type'],
                    target_type=action_data['target_type'],
                    target_id=random.randint(1, 50),
                    details_json={'message': action_data['details']},
                    ip_address=f'192.168.1.{random.randint(1, 255)}'
                )
                db.session.add(log_entry)
            
            db.session.commit()
        
        # ==================== Summary ====================
        print("\n" + "=" * 60)
        print("[SUCCESS] DEMO Database seeding completed!")
        print("=" * 60)
        
        print("\n[SUMMARY] Data Summary:")
        print(f"   - Features: 6")
        print(f"   - Services: 16")
        print(f"   - Admins: 2")
        print(f"   - Customers: 15 (13 active, 2 suspended)")
        print(f"   - Engineers: 12 (8 active, 2 pending, 1 expired, 1 suspended)")
        print(f"   - Requests: 35 (various statuses)")
        print(f"   - Reviews: 25")
        print(f"   - Transactions: 18")
        print(f"   - Disputes: 5")
        print(f"   - Blocks: 4")
        print(f"   - Portfolio Items: ~20")
        print(f"   - Notifications: 30")
        if HAS_AUDIT_LOG:
            print(f"   - Audit Log Entries: 20")
        
        print("\n[ACCOUNTS] Demo Accounts:")
        print("   +----------------------------------------------------------+")
        print("   |  ADMIN                                                   |")
        print("   |    Email: admin@test.com                                 |")
        print("   |    Pass:  Pass123!                                       |")
        print("   +----------------------------------------------------------+")
        print("   |  CUSTOMER                                                |")
        print("   |    Email: customer1@test.com                             |")
        print("   |    Pass:  Pass123!                                       |")
        print("   +----------------------------------------------------------+")
        print("   |  ENGINEER (Active)                                       |")
        print("   |    Email: engineer1@test.com                             |")
        print("   |    Pass:  Pass123!                                       |")
        print("   +----------------------------------------------------------+")
        print("   |  ENGINEER (Expired Subscription)                         |")
        print("   |    Email: engineer9@test.com                             |")
        print("   |    Pass:  Pass123!                                       |")
        print("   +----------------------------------------------------------+")
        print("   |  ENGINEER (Pending Approval)                             |")
        print("   |    Email: engineer11@test.com                            |")
        print("   |    Pass:  Pass123!                                       |")
        print("   +----------------------------------------------------------+")
        
        print("\n[SCENARIOS] Demo Scenarios to Show:")
        print("   1. Admin Dashboard - Shows KPIs, charts, recent activity")
        print("   2. Engineer Recommendations - AI-powered matching")
        print("   3. SLA Monitoring - At-risk and breached requests")
        print("   4. Dispute Resolution - Admin handling complaints")
        print("   5. Financial Reports - Revenue, commissions, CSV export")
        print("   6. Audit Trail - All admin actions logged")
        print("   7. Block List - Users can block engineers")
        print("   8. Review System - Ratings and feedback")
        print()


if __name__ == '__main__':
    seed_demo_database()
