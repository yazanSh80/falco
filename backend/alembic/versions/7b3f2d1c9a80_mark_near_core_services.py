"""mark near core services

Revision ID: 7b3f2d1c9a80
Revises: 6a2d5c9e4f10
Create Date: 2026-05-05 20:10:00.000000
"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '7b3f2d1c9a80'
down_revision = '6a2d5c9e4f10'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        UPDATE services
        SET is_core = 0,
            active = 1,
            is_visible = 1
        WHERE id IN ('FB001', 'SM001')
    """)


def downgrade():
    op.execute("""
        UPDATE services
        SET is_core = 1
        WHERE id IN ('FB001', 'SM001')
    """)
