#!/usr/bin/env python3
"""
Database Initialization Script for Falco Electrec
Initializes the MySQL database with proper schema and constraints
"""

import sys
import os
import subprocess
from pathlib import Path
from datetime import datetime

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def print_header(text):
    """Print formatted header"""
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70 + "\n")

def print_step(step_num, text):
    """Print step indicator"""
    print(f"[Step {step_num}] {text}...")

def print_success(text):
    """Print success message"""
    print(f"✓ {text}")

def print_error(text):
    """Print error message"""
    print(f"✗ ERROR: {text}")

def run_sql_file(sql_file_path):
    """Execute SQL file against MySQL database"""
    try:
        print_step(1, f"Reading SQL file: {sql_file_path}")
        
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Full MySQL path
        mysql_exe = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
        
        if not os.path.exists(mysql_exe):
            print_error(f"MySQL executable not found at {mysql_exe}")
            return False
        
        print_step(2, "Executing SQL schema")
        
        # Execute SQL
        process = subprocess.Popen(
            [mysql_exe, '-u', 'root', '-pYy@102030'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=sql_content)
        
        if process.returncode != 0:
            print_error(f"SQL execution failed: {stderr}")
            return False
        
        print_success("SQL schema executed successfully")
        return True
        
    except Exception as e:
        print_error(f"Failed to execute SQL file: {str(e)}")
        return False

def create_all_tables_via_orm():
    """Create tables using Flask-SQLAlchemy"""
    try:
        print_step(3, "Creating tables via SQLAlchemy ORM")
        
        from app import create_app
        from app.extensions import db
        
        app = create_app()
        
        with app.app_context():
            print("Setting up database context...")
            
            # Create all tables from models
            print("Creating tables...")
            db.create_all()
            
            print_success("All tables created via ORM")
            return True
            
    except Exception as e:
        print_error(f"Failed to create tables via ORM: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def verify_database():
    """Verify database schema"""
    try:
        print_step(4, "Verifying database schema")
        
        mysql_exe = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
        
        # List all tables
        sql = "USE Graduation; SHOW TABLES;"
        
        process = subprocess.Popen(
            [mysql_exe, '-u', 'root', '-pYy@102030'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        stdout, stderr = process.communicate(input=sql)
        
        if process.returncode == 0:
            tables = [line.strip() for line in stdout.split('\n') if line.strip() and line != 'Tables_in_Graduation']
            print_success(f"Database verification complete")
            print(f"\nTables created: {len(tables)}")
            for table in tables:
                print(f"  ✓ {table}")
            return True
        else:
            print_error(f"Verification failed: {stderr}")
            return False
            
    except Exception as e:
        print_error(f"Failed to verify database: {str(e)}")
        return False

def seed_data():
    """Seed initial data (features and services)"""
    try:
        print_step(5, "Seeding initial data")
        
        from app import create_app
        from app.extensions import db
        from app.models.service import Feature, Service
        
        app = create_app()
        
        with app.app_context():
            # Check if features already exist
            existing_features = Feature.query.count()
            
            if existing_features > 0:
                print(f"Features already seeded ({existing_features} found), skipping...")
                return True
            
            print("Creating features...")
            features_data = [
                ('AC_MAINTENANCE', 'A/C Maintenance', 'air', 'Air conditioning maintenance and repair services'),
                ('PLUMBING', 'Plumbing', 'droplet', 'Plumbing repair and installation services'),
                ('CARPENTRY', 'Carpentry', 'hammer', 'Carpentry and wooden furnishing services'),
                ('ELECTRICITY', 'Electricity', 'zap', 'Electrical repair and installation services'),
                ('ALUMETAL', 'Alumetal', 'square', 'Aluminum and metal works'),
                ('PAINTING', 'Painting', 'palette', 'Interior and exterior painting services'),
                ('OTHER', 'Other Services', 'briefcase', 'Other miscellaneous services'),
            ]
            
            for feature_id, name, icon, desc in features_data:
                feature = Feature(id=feature_id, name=name, icon=icon, description=desc)
                db.session.add(feature)
            
            db.session.commit()
            print_success(f"Created {len(features_data)} features")
            
            print("Creating services...")
            services_data = [
                # A/C Maintenance
                ('AC001', 'AC_MAINTENANCE', 'General A/C Maintenance', 'Regular AC unit maintenance and cleaning', 200.0),
                ('AC002', 'AC_MAINTENANCE', 'A/C Installation', 'New AC unit installation', 1500.0),
                ('AC003', 'AC_MAINTENANCE', 'A/C Repair', 'AC repair and troubleshooting', 400.0),
                
                # Plumbing
                ('PL001', 'PLUMBING', 'Leak Repair', 'Fix water leaks', 250.0),
                ('PL002', 'PLUMBING', 'Drain Cleaning', 'Unclog drains', 300.0),
                ('PL003', 'PLUMBING', 'Water Heater Installation', 'Install water heater', 1200.0),
                
                # Carpentry
                ('CP001', 'CARPENTRY', 'Door Installation', 'Install new door', 400.0),
                ('CP002', 'CARPENTRY', 'Cabinet Repair', 'Repair cabinets', 350.0),
                ('CP003', 'CARPENTRY', 'Custom Shelving', 'Build custom shelves', 600.0),
                
                # Electricity
                ('EL001', 'ELECTRICITY', 'Outlet Installation', 'Install electrical outlets', 200.0),
                ('EL002', 'ELECTRICITY', 'Light Installation', 'Install lights/fixtures', 350.0),
                ('EL003', 'ELECTRICITY', 'Circuit Repair', 'Fix electrical circuits', 500.0),
                
                # Aluminum
                ('AL001', 'ALUMETAL', 'Window Grill Installation', 'Install security grills', 800.0),
                ('AL002', 'ALUMETAL', 'Door Frame Repair', 'Repair aluminum door frames', 400.0),
                
                # Painting
                ('PA001', 'PAINTING', 'Room Painting', 'Paint a room', 500.0),
                ('PA002', 'PAINTING', 'Exterior Painting', 'Paint building exterior', 1500.0),
                
                # Other
                ('OT001', 'OTHER', 'General Consultation', 'General consultation service', 100.0),
                ('OT002', 'OTHER', 'Miscellaneous Repair', 'Minor repairs and fixes', 250.0),
            ]
            
            for service_id, feature_id, name, desc, price in services_data:
                service = Service(
                    id=service_id,
                    feature_id=feature_id,
                    name=name,
                    description=desc,
                    base_price=price
                )
                db.session.add(service)
            
            db.session.commit()
            print_success(f"Created {len(services_data)} services")
            
            # Create sample areas
            print("Creating service areas...")
            from app.models.area import Area
            
            existing_areas = Area.query.count()
            if existing_areas == 0:
                areas_data = [
                    ('Hebron City', 'مدينة الخليل', 'City center and surrounding areas'),
                    ('Bethlehem', 'بيت لحم', 'Bethlehem municipality area'),
                    ('Ramallah', 'رام الله', 'Ramallah and Al-Bireh area'),
                    ('Nablus', 'نابلس', 'Nablus city area'),
                    ('Jenin', 'جنين', 'Jenin municipality area'),
                    ('Jericho', 'أريحا', 'Jericho and surroundings'),
                    ('Tulkarm', 'طولكرم', 'Tulkarm city area'),
                ]
                
                for name, name_ar, desc in areas_data:
                    area = Area(name=name, name_ar=name_ar, description=desc, is_active=True)
                    db.session.add(area)
                
                db.session.commit()
                print_success(f"Created {len(areas_data)} service areas")
            else:
                print(f"Service areas already exist ({existing_areas} found), skipping...")
            
            return True
            
    except Exception as e:
        print_error(f"Failed to seed data: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main initialization routine"""
    print_header("FALCO ELECTREC - DATABASE INITIALIZATION")
    
    print(f"Database: Graduation")
    print(f"User: root")
    print(f"Host: localhost")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Step 1: Create tables via ORM
    if not create_all_tables_via_orm():
        print_error("Failed to create tables")
        return False
    
    # Step 2: Verify database
    if not verify_database():
        print_error("Database verification failed")
        return False
    
    # Step 3: Seed initial data
    if not seed_data():
        print_error("Failed to seed data")
        # Continue anyway - seed can be done later
    
    print_header("INITIALIZATION COMPLETE")
    
    print("✓ Database initialized successfully!")
    print("\nNext steps:")
    print("  1. Start the Flask backend: python run.py")
    print("  2. Run demo seed if needed: python seed_demo.py")
    print("  3. Access API at: http://localhost:5000")
    print("  4. View Swagger docs at: http://localhost:5000/api/docs")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
