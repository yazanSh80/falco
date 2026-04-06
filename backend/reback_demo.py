#!/usr/bin/env python
"""
Reback Demo Script - Restores previous backup and reseeds with demo data
"""
import sys
import os
from datetime import datetime

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db

def restore_and_seed():
    """Restore from backup and seed with demo data."""
    app = create_app()
    
    with app.app_context():
        print("\nREBACK DEMO PROCESS")
        print("=" * 50)
        
        # Step 1: Drop and recreate database
        print("\n[1/3] Preparing database...")
        try:
            db.drop_all()
            print("     [OK] Dropped existing tables")
            db.create_all()
            print("     [OK] Created fresh schema")
        except Exception as e:
            print(f"     [ERROR] {e}")
            return False
        
        # Step 2: Import and run seed_demo
        print("\n[2/3] Importing seed_demo module...")
        try:
            from seed_demo import seed_demo_database
            print("     [OK] seed_demo module loaded")
        except Exception as e:
            print(f"     [ERROR] Error importing seed_demo: {e}")
            return False
        
        # Step 3: Run the seed function
        print("\n[3/3] Seeding demo data...")
        try:
            seed_demo_database()
            print("     [OK] Demo data seeded successfully")
        except Exception as e:
            print(f"     [ERROR] Error seeding data: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        print("\n" + "=" * 50)
        print("[SUCCESS] REBACK COMPLETE!")
        print("   - Database restored")
        print("   - Demo data populated")
        print("=" * 50 + "\n")
        return True

if __name__ == '__main__':
    success = restore_and_seed()
    sys.exit(0 if success else 1)
