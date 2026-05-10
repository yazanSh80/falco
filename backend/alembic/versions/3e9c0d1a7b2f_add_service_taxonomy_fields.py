"""add service taxonomy fields

Revision ID: 3e9c0d1a7b2f
Revises: fb56bee058c3
Create Date: 2026-05-05 15:45:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3e9c0d1a7b2f'
down_revision = 'c3e2b7a8d901'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('services', sa.Column('domain', sa.String(length=30), nullable=False, server_default='electrical'))
    op.add_column('services', sa.Column('service_kind', sa.String(length=30), nullable=False, server_default='standard_service'))
    op.add_column('services', sa.Column('pricing_mode', sa.String(length=30), nullable=False, server_default='fixed'))


def downgrade():
    op.drop_column('services', 'pricing_mode')
    op.drop_column('services', 'service_kind')
    op.drop_column('services', 'domain')
