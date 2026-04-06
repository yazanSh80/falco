#!/usr/bin/env python3
"""Update admin password"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()
with app.app_context():
    # Get the first admin
    admin = User.query.filter_by(role='admin').first()
    if admin:
        print(f"Updating admin: {admin.name} ({admin.email})")
        admin.set_password("TestPass123")
        db.session.commit()
        print(f"Password updated to: TestPass123")
        print(f"Admin email: {admin.email}")
    else:
        print("No admin found!")
