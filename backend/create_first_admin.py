#!/usr/bin/env python3
"""Create first admin in the database"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus

app = create_app()
with app.app_context():
    # Check if admin already exists
    admin_count = User.query.filter_by(role=UserRole.ADMIN.value).count()
    if admin_count > 0:
        print(f"Admin already exists! Found {admin_count} admin(s)")
        sys.exit(0)
    
    # Create first admin
    admin = User(
        name="Admin User",
        email="admin@falco.com",
        phone="0591234567",
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value
    )
    admin.set_password("Admin12345")
    
    db.session.add(admin)
    db.session.commit()
    
    print(f"First admin created successfully!")
    print(f"Email: {admin.email}")
    print(f"ID: {admin.id}")
    print(f"Role: {admin.role}")
    print(f"Status: {admin.status}")
