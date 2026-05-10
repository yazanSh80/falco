"""add engineer domain

Revision ID: 8f4a2d9c1b0e
Revises: 3e9c0d1a7b2f
Create Date: 2026-05-05 16:10:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f4a2d9c1b0e'
down_revision = '3e9c0d1a7b2f'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'engineer_profiles',
        sa.Column('domain', sa.String(length=30), nullable=False, server_default='electrical')
    )


def downgrade():
    op.drop_column('engineer_profiles', 'domain')
