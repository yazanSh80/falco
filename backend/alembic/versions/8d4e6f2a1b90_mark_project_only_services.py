"""mark project only services

Revision ID: 8d4e6f2a1b90
Revises: 7b3f2d1c9a80
Create Date: 2026-05-05 20:25:00.000000
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '8d4e6f2a1b90'
down_revision = '7b3f2d1c9a80'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        UPDATE services
        SET service_kind = 'inspection',
            pricing_mode = 'inspection_fee',
            complexity = 'advanced',
            requires_visit = 1,
            active = 1,
            is_visible = 1,
            is_core = 0
        WHERE id = 'SO001'
    """)
    op.execute("""
        UPDATE services
        SET service_kind = 'project_entry',
            pricing_mode = 'project_quote',
            complexity = 'project',
            requires_visit = 0,
            base_price = 0,
            active = 1,
            is_visible = 0,
            is_core = 0
        WHERE id = 'SP001'
    """)


def downgrade():
    op.execute("""
        UPDATE services
        SET is_core = 1
        WHERE id = 'SO001'
    """)
