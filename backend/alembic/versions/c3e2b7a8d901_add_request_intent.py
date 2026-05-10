"""add request intent

Revision ID: c3e2b7a8d901
Revises: fb56bee058c3
Create Date: 2026-05-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3e2b7a8d901'
down_revision = 'fb56bee058c3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'requests',
        sa.Column('request_intent', sa.String(length=30), nullable=True),
    )


def downgrade():
    op.drop_column('requests', 'request_intent')
