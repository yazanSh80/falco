"""add service metadata visit complexity

Revision ID: 6a2d5c9e4f10
Revises: 4d1a7f9c2e6b
Create Date: 2026-05-05 19:45:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6a2d5c9e4f10'
down_revision = '4d1a7f9c2e6b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'services',
        sa.Column('complexity', sa.String(length=30), nullable=False, server_default='standard')
    )
    op.add_column(
        'services',
        sa.Column('requires_visit', sa.Boolean(), nullable=False, server_default=sa.text('1'))
    )


def downgrade():
    op.drop_column('services', 'requires_visit')
    op.drop_column('services', 'complexity')
