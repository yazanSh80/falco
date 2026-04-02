"""
CLI Commands for FalcoElectrec
Custom Flask CLI commands for administrative tasks.
"""
import os
import shutil
from datetime import datetime
from flask import current_app
import click


def init_cli(app):
    """Initialize CLI commands for the Flask app."""
    
    @app.cli.command('backup-db')
    @click.option('--output-dir', default='backups', help='Directory to store backups')
    def backup_db(output_dir):
        """Create a timestamped backup of the SQLite database.
        
        Usage:
            flask backup-db
            flask backup-db --output-dir /path/to/backups
        
        Creates a backup file named: falco_backup_YYYYMMDD_HHMMSS.db
        """
        # Get the database URI
        db_uri = current_app.config.get('SQLALCHEMY_DATABASE_URI', '')
        
        if not db_uri.startswith('sqlite:///'):
            click.echo('Error: Backup command only works with SQLite databases')
            return 1
        
        # Extract the database path
        if db_uri.startswith('sqlite:////'):
            # Absolute path (4 slashes for Unix, or on Windows with drive letter)
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
    
    @app.cli.command('list-backups')
    @click.option('--backup-dir', default='backups', help='Directory containing backups')
    def list_backups(backup_dir):
        """List all database backups.
        
        Usage:
            flask list-backups
            flask list-backups --backup-dir /path/to/backups
        """
        # Make relative to the backend folder
        if not os.path.isabs(backup_dir):
            backend_dir = os.path.dirname(current_app.instance_path)
            backup_dir = os.path.join(backend_dir, backup_dir)
        
        if not os.path.exists(backup_dir):
            click.echo(f'No backup directory found at: {backup_dir}')
            return 0
        
        backups = sorted([
            f for f in os.listdir(backup_dir) 
            if f.startswith('falco_backup_') and f.endswith('.db')
        ])
        
        if not backups:
            click.echo('No backups found.')
            return 0
        
        click.echo(f'📁 Backups in {backup_dir}:')
        click.echo('-' * 60)
        
        total_size = 0
        for backup in backups:
            backup_path = os.path.join(backup_dir, backup)
            size = os.path.getsize(backup_path)
            total_size += size
            
            # Parse timestamp from filename
            try:
                ts = backup.replace('falco_backup_', '').replace('.db', '')
                dt = datetime.strptime(ts, '%Y%m%d_%H%M%S')
                date_str = dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                date_str = 'Unknown'
            
            click.echo(f'{backup}  |  {size/1024:.2f} KB  |  {date_str}')
        
        click.echo('-' * 60)
        click.echo(f'Total: {len(backups)} backups, {total_size/1024:.2f} KB')
        return 0
    
    @app.cli.command('restore-db')
    @click.argument('backup_file')
    @click.option('--force', is_flag=True, help='Restore without confirmation')
    def restore_db(backup_file, force):
        """Restore database from a backup file.
        
        Usage:
            flask restore-db falco_backup_20241223_120000.db
            flask restore-db /path/to/backup.db --force
        """
        # Get the database URI
        db_uri = current_app.config.get('SQLALCHEMY_DATABASE_URI', '')
        
        if not db_uri.startswith('sqlite:///'):
            click.echo('Error: Restore command only works with SQLite databases')
            return 1
        
        # Extract the database path
        if db_uri.startswith('sqlite:////'):
            db_path = db_uri[10:]
        else:
            db_path = db_uri[10:]
            if not os.path.isabs(db_path):
                db_path = os.path.join(current_app.instance_path, db_path)
        
        # Find the backup file
        if not os.path.isabs(backup_file):
            backend_dir = os.path.dirname(current_app.instance_path)
            backup_path = os.path.join(backend_dir, 'backups', backup_file)
        else:
            backup_path = backup_file
        
        if not os.path.exists(backup_path):
            click.echo(f'Error: Backup file not found: {backup_path}')
            return 1
        
        if not force:
            click.echo(f'⚠️  Warning: This will replace the current database!')
            click.echo(f'   Current DB: {db_path}')
            click.echo(f'   Backup: {backup_path}')
            if not click.confirm('Are you sure you want to continue?'):
                click.echo('Restore cancelled.')
                return 0
        
        try:
            # Create a backup of current DB before restore
            if os.path.exists(db_path):
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                pre_restore_backup = f'{db_path}.pre_restore_{timestamp}'
                shutil.copy2(db_path, pre_restore_backup)
                click.echo(f'📁 Created pre-restore backup: {pre_restore_backup}')
            
            # Restore the backup
            shutil.copy2(backup_path, db_path)
            click.echo(f'✅ Database restored successfully from: {backup_path}')
            return 0
            
        except Exception as e:
            click.echo(f'Error restoring database: {str(e)}')
            return 1
    
    @app.cli.command('cleanup-backups')
    @click.option('--keep', default=10, help='Number of recent backups to keep')
    @click.option('--backup-dir', default='backups', help='Directory containing backups')
    @click.option('--force', is_flag=True, help='Delete without confirmation')
    def cleanup_backups(keep, backup_dir, force):
        """Remove old backups, keeping only the most recent ones.
        
        Usage:
            flask cleanup-backups --keep 5
            flask cleanup-backups --keep 10 --force
        """
        if not os.path.isabs(backup_dir):
            backend_dir = os.path.dirname(current_app.instance_path)
            backup_dir = os.path.join(backend_dir, backup_dir)
        
        if not os.path.exists(backup_dir):
            click.echo('No backup directory found.')
            return 0
        
        backups = sorted([
            f for f in os.listdir(backup_dir) 
            if f.startswith('falco_backup_') and f.endswith('.db')
        ])
        
        if len(backups) <= keep:
            click.echo(f'Only {len(backups)} backups exist. Nothing to clean up.')
            return 0
        
        to_delete = backups[:-keep]
        
        if not force:
            click.echo(f'Will delete {len(to_delete)} old backups, keeping {keep} most recent:')
            for backup in to_delete:
                click.echo(f'  - {backup}')
            if not click.confirm('Continue?'):
                click.echo('Cleanup cancelled.')
                return 0
        
        deleted = 0
        for backup in to_delete:
            try:
                os.remove(os.path.join(backup_dir, backup))
                deleted += 1
            except Exception as e:
                click.echo(f'Error deleting {backup}: {e}')
        
        click.echo(f'✅ Deleted {deleted} old backups.')
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
