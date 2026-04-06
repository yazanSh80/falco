#!/usr/bin/env python3
"""Create database tables"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db

app = create_app()
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")
    
    # List tables
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\nTables created: {len(tables)}")
    for table in sorted(tables):
        print(f"  - {table}")
