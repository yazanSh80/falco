"""
Release security baseline tests.
"""
import pytest

from app.extensions import db
from app.config import _database_url, _secret_env
from app.models.admin_action_log import AdminActionLog


def test_production_requires_secret_key(monkeypatch):
    """Production must not start with generated application secrets."""
    monkeypatch.setenv('FLASK_ENV', 'production')
    monkeypatch.delenv('SECRET_KEY', raising=False)

    with pytest.raises(RuntimeError, match='SECRET_KEY must be set in production'):
        _secret_env('SECRET_KEY')


def test_production_requires_database_url(monkeypatch):
    """Production must use an explicit database URL."""
    monkeypatch.setenv('FLASK_ENV', 'production')
    monkeypatch.delenv('DATABASE_URL', raising=False)

    with pytest.raises(RuntimeError, match='DATABASE_URL must be set in production'):
        _database_url()


def test_development_database_url_has_local_fallback(monkeypatch):
    """Local development keeps the existing MySQL fallback."""
    monkeypatch.setenv('FLASK_ENV', 'development')
    monkeypatch.delenv('DATABASE_URL', raising=False)

    assert _database_url().startswith('mysql+pymysql://')


def test_admin_action_audit_log_records_security_relevant_actions(app, admin_user):
    """Admin operations have an audit log path for release monitoring."""
    log_entry = AdminActionLog.log(
        admin_id=admin_user.id,
        action_type='release_security_smoke',
        target_type='release_gate',
        target_id='P9-03',
        details={'scope': 'security_basics'}
    )
    db.session.commit()

    stored = AdminActionLog.query.get(log_entry.id)
    assert stored is not None
    assert stored.admin_id == admin_user.id
    assert stored.action_type == 'release_security_smoke'
