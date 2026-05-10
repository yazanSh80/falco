"""
CLI Commands for FalcoElectrec.
"""
import click

from .extensions import db


def init_cli(app):
    """Initialize CLI commands for the Flask app."""

    @app.cli.command("backup-db")
    @click.option("--output-dir", default="backups", help="Directory to store backups")
    def backup_db(output_dir):
        """Show the recommended MySQL backup command."""
        click.echo("Use mysqldump for MySQL backups:")
        click.echo(f"mysqldump -u falco -pfalco_secret Graduation > {output_dir}/backup.sql")
        return 0

    @app.cli.command("mysql-restore")
    @click.argument("backup_file")
    @click.option("--force", is_flag=True)
    def mysql_restore(backup_file, force):
        """Show the recommended MySQL restore command."""
        if not force:
            click.echo("Tip: inspect the SQL file before restoring, then rerun with --force.")
            return 0

        click.echo("Use mysql CLI for restore:")
        click.echo(f"mysql -u falco -pfalco_secret Graduation < {backup_file}")
        return 0

    @app.cli.command("add-indexes")
    def add_indexes():
        """Add performance indexes to the database."""
        indexes = [
            "CREATE INDEX IF NOT EXISTS ix_requests_status ON requests (status)",
            "CREATE INDEX IF NOT EXISTS ix_requests_customer_id ON requests (customer_id)",
            "CREATE INDEX IF NOT EXISTS ix_requests_engineer_id ON requests (engineer_id)",
            "CREATE INDEX IF NOT EXISTS ix_requests_created_at ON requests (created_at)",
            "CREATE INDEX IF NOT EXISTS ix_reviews_reviewee_id ON reviews (reviewee_id)",
            "CREATE INDEX IF NOT EXISTS ix_reviews_request_id ON reviews (request_id)",
            "CREATE INDEX IF NOT EXISTS ix_transactions_engineer_id ON transactions (engineer_id)",
            "CREATE INDEX IF NOT EXISTS ix_transactions_customer_id ON transactions (customer_id)",
            "CREATE INDEX IF NOT EXISTS ix_disputes_status ON disputes (status)",
            "CREATE INDEX IF NOT EXISTS ix_disputes_created_by ON disputes (created_by)",
            "CREATE INDEX IF NOT EXISTS ix_disputes_against_user_id ON disputes (against_user_id)",
            "CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id)",
            "CREATE INDEX IF NOT EXISTS ix_notifications_read ON notifications (read)",
            "CREATE INDEX IF NOT EXISTS ix_users_email ON users (email)",
            "CREATE INDEX IF NOT EXISTS ix_users_role ON users (role)",
            "CREATE INDEX IF NOT EXISTS ix_users_status ON users (status)",
            "CREATE INDEX IF NOT EXISTS ix_admin_action_logs_admin_id ON admin_action_logs (admin_id)",
            "CREATE INDEX IF NOT EXISTS ix_admin_action_logs_action_type ON admin_action_logs (action_type)",
            "CREATE INDEX IF NOT EXISTS ix_admin_action_logs_created_at ON admin_action_logs (created_at)",
        ]

        click.echo("Adding performance indexes...")
        success_count = 0

        for index_sql in indexes:
            index_name = index_sql.split("IF NOT EXISTS ")[1].split(" ON")[0]
            try:
                db.session.execute(db.text(index_sql))
                click.echo(f"  OK {index_name}")
                success_count += 1
            except Exception as exc:
                click.echo(f"  WARN {index_name}: {exc}")

        db.session.commit()
        click.echo(f"Index creation complete: {success_count}/{len(indexes)} created or verified.")
        return 0
