"""mark legacy demo services

Revision ID: 9c5a1e7d3b20
Revises: 8d4e6f2a1b90
Create Date: 2026-05-05 20:40:00.000000
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '9c5a1e7d3b20'
down_revision = '8d4e6f2a1b90'
branch_labels = None
depends_on = None


LEGACY_IDS = "'S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15','S16'"


def upgrade():
    op.execute(f"""
        UPDATE services
        SET domain = 'legacy',
            service_kind = 'legacy_service',
            pricing_mode = 'fixed',
            complexity = 'standard',
            requires_visit = 1,
            active = 0,
            is_visible = 0,
            is_core = 0
        WHERE id IN ({LEGACY_IDS})
    """)


def downgrade():
    op.execute(f"""
        UPDATE services
        SET active = 1,
            is_visible = 1,
            is_core = 1
        WHERE id IN ({LEGACY_IDS})
    """)
