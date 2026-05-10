"""
Database Indexes Migration for FalcoElectrec
This script ensures all performance indexes are created.

Run with: python -c "from add_indexes import add_indexes; add_indexes()"
Or use: flask db upgrade (if using Flask-Migrate)
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db


def add_indexes():
    """Add performance indexes to the database if they don't exist."""
    app = create_app()
    
    with app.app_context():
# MySQL index creation statements
        indexes = [
            # Requests table indexes
            "CREATE INDEX IF NOT EXISTS ix_requests_status ON requests (status)",
            "CREATE INDEX IF NOT EXISTS ix_requests_customer_id ON requests (customer_id)",
            "CREATE INDEX IF NOT EXISTS ix_requests_engineer_id ON requests (engineer_id)",
            "CREATE INDEX IF NOT EXISTS ix_requests_created_at ON requests (created_at)",
            
            # Reviews table indexes
            "CREATE INDEX IF NOT EXISTS ix_reviews_reviewee_id ON reviews (reviewee_id)",
            "CREATE INDEX IF NOT EXISTS ix_reviews_request_id ON reviews (request_id)",
            
            # Transactions table indexes
            "CREATE INDEX IF NOT EXISTS ix_transactions_engineer_id ON transactions (engineer_id)",
            "CREATE INDEX IF NOT EXISTS ix_transactions_customer_id ON transactions (customer_id)",
            
            # Disputes table indexes
            "CREATE INDEX IF NOT EXISTS ix_disputes_status ON disputes (status)",
            "CREATE INDEX IF NOT EXISTS ix_disputes_created_by ON disputes (created_by)",
            "CREATE INDEX IF NOT EXISTS ix_disputes_against_user_id ON disputes (against_user_id)",
            
            # Notifications table indexes
            "CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id)",
            "CREATE INDEX IF NOT EXISTS ix_notifications_read ON notifications (read)",
            
            # Users table indexes  
            "CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)",
            "CREATE INDEX IF NOT EXISTS ix_users_role ON users (role)",
            "CREATE INDEX IF NOT EXISTS ix_users_status ON users (status)",
            
            # Admin action logs
            "CREATE INDEX IF NOT EXISTS ix_admin_action_logs_admin_id ON admin_action_logs (admin_id)",
            "CREATE INDEX IF NOT EXISTS ix_admin_action_logs_action_type ON admin_action_logs (action_type)",
            "CREATE INDEX IF NOT EXISTS ix_admin_action_logs_created_at ON admin_action_logs (created_at)",
        ]
        
        print("Adding performance indexes...")
        
        for index_sql in indexes:
            try:
                db.session.execute(db.text(index_sql))
                index_name = index_sql.split("IF NOT EXISTS ")[1].split(" ON")[0]
                print(f"  ✅ {index_name}")
            except Exception as e:
                index_name = index_sql.split("IF NOT EXISTS ")[1].split(" ON")[0]
                print(f"  ⚠️ {index_name}: {str(e)}")
        
        db.session.commit()
        print("\n✅ Index creation complete!")


if __name__ == '__main__':
    add_indexes()
