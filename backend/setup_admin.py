#!/usr/bin/env python3
"""List and create admins"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus

app = create_app()
with app.app_context():
    # List existing admins
    admins = User.query.filter_by(role=UserRole.ADMIN.value).all()
    print(f"Found {len(admins)} admin(s):")
    for admin in admins:
        print(f"  - ID: {admin.id}, Name: {admin.name}, Email: {admin.email}, Status: {admin.status}")
    
    # Delete all admins and create one fresh with known credentials
    print("\nDeleting existing admins...")
    for admin in admins:
        db.session.delete(admin)
    db.session.commit()
    
    # Create fresh admin
    print("Creating fresh admin...")
    admin = User(
        name="Test Admin",
        email="testadmin@example.com",
        phone="0591234567",
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value
    )
    admin.set_password("TestAdmin123")
    
    db.session.add(admin)
    db.session.commit()
    
    print(f"\nAdmin created successfully!")
    print(f"Email: {admin.email}")
    print(f"Password: TestAdmin123")
    print(f"ID: {admin.id}")
