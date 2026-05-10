"""add service visibility flags

Revision ID: 4d1a7f9c2e6b
Revises: 8f4a2d9c1b0e
Create Date: 2026-05-05 16:25:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4d1a7f9c2e6b'
down_revision = '8f4a2d9c1b0e'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'services',
        sa.Column('is_visible', sa.Boolean(), nullable=False, server_default=sa.text('1'))
    )
    op.add_column(
        'services',
        sa.Column('is_core', sa.Boolean(), nullable=False, server_default=sa.text('1'))
    )


def downgrade():
    op.drop_column('services', 'is_core')
    op.drop_column('services', 'is_visible')
