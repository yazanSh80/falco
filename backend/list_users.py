#!/usr/bin/env python3
"""Check existing users"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()
with app.app_context():
    all_users = User.query.all()
    print(f"Total users in database: {len(all_users)}\n")
    
    for user in all_users:
        print(f"ID: {user.id}  |  Name: {user.name}  |  Email: {user.email}  |  Role: {user.role}  |  Status: {user.status}")
    
    print()
    admins = User.query.filter_by(role='admin').all()
    print(f"\nAdmins: {len(admins)}")
    for admin in admins:
        print(f"  - {admin.name} ({admin.email})")
