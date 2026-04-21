"""
CLI Commands for FalcoElectrec
Custom Flask CLI commands for administrative tasks.
"""
import os
from flask import current_app
import click
from .extensions import db


def init_cli(app):
    """Initialize CLI commands for the Flask app."""
    
    @app.cli.command('backup-db')
    @click.option('--output-dir', default='backups', help='Directory to store backups')
    def backup_db(output_dir):

        \"\"\"Reminder: Use mysqldump for MySQL backups (SQLite commands disabled)
        
        Usage: mysqldump -u falco -pfalco_secret Graduation > backup.sql
        \"\"\"
        click.echo('Use mysqldump for MySQL backups')
        click.echo('mysqldump -u falco -pfalco_secret Graduation > backup.sql')
        return 0

        
        # Extract the database path
        # DEPRECATED: sqlite://// (MySQL only)

            db_path = db_uri[10:]
        else:
            # Relative path (3 slashes)
            db_path = db_uri[10:]
            # Make it relative to the instance folder or app root
            if not os.path.isabs(db_path):
                db_path = os.path.join(current_app.instance_path, db_path)
        
        if not os.path.exists(db_path):
            click.echo(f'Error: Database file not found: {db_path}')
            return 1
        
        # Create backup directory if it doesn't exist
        backup_dir = output_dir
        if not os.path.isabs(backup_dir):
            # Make relative to the backend folder
            backend_dir = os.path.dirname(current_app.instance_path)
            backup_dir = os.path.join(backend_dir, output_dir)
        
        os.makedirs(backup_dir, exist_ok=True)
        
        # Generate backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'falco_backup_{timestamp}.db'
        backup_path = os.path.join(backup_dir, backup_filename)
        
        try:
            # Copy the database file
            shutil.copy2(db_path, backup_path)
            
            # Get file sizes for reporting
            original_size = os.path.getsize(db_path)
            backup_size = os.path.getsize(backup_path)
            
            click.echo(f'✅ Backup created successfully!')
            click.echo(f'   Source: {db_path}')
            click.echo(f'   Backup: {backup_path}')
            click.echo(f'   Size: {backup_size / 1024:.2f} KB')
            
            # List existing backups
            existing_backups = sorted([
                f for f in os.listdir(backup_dir) 
                if f.startswith('falco_backup_') and f.endswith('.db')
            ])
            
            if len(existing_backups) > 1:
                click.echo(f'\n📁 Total backups in {backup_dir}: {len(existing_backups)}')
                click.echo('   Recent backups:')
                for backup in existing_backups[-5:]:
                    click.echo(f'   - {backup}')
            
            return 0
            
        except Exception as e:
            click.echo(f'Error creating backup: {str(e)}')
            return 1
    

    
@app.cli.command('mysql-restore')
    @click.argument('backup_file')
    @click.option('--force', is_flag=True)
    def mysql_restore(backup_file, force):
        """Reminder: MySQL restore uses mysql CLI (SQLite disabled).
        
        Usage: mysql -u falco -pfalco_secret Graduation < backup.sql
        \"\"\"
        click.echo('Use mysql CLI for restore:')
        click.echo('mysql -u falco -pfalco_secret Graduation < ' + backup_file)
        return 0

    

    
    @app.cli.command('add-indexes')
    def add_indexes():
        """Add performance indexes to the database.
        
        Usage:
            flask add-indexes
        
        Creates indexes on frequently queried columns for better performance.
        """
        from .extensions import db
        
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
        
        click.echo("Adding performance indexes...")
        
        success_count = 0
        for index_sql in indexes:
            try:
                db.session.execute(db.text(index_sql))
                index_name = index_sql.split("IF NOT EXISTS ")[1].split(" ON")[0]
                click.echo(f"  ✅ {index_name}")
                success_count += 1
            except Exception as e:
                index_name = index_sql.split("IF NOT EXISTS ")[1].split(" ON")[0]
                click.echo(f"  ⚠️ {index_name}: {str(e)}")
        
        db.session.commit()
        click.echo(f"\n✅ Index creation complete! {success_count}/{len(indexes)} indexes created/verified.")
        return 0
