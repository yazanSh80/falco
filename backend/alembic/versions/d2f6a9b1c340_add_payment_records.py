"""add payment records

Revision ID: d2f6a9b1c340
Revises: 9c5a1e7d3b20
Create Date: 2026-05-05 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = 'd2f6a9b1c340'
down_revision = '9c5a1e7d3b20'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'payment_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('request_id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('engineer_id', sa.Integer(), nullable=True),
        sa.Column('method', sa.String(length=30), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('purpose', sa.String(length=30), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('proof_reference', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('commission_rate', sa.Float(), nullable=False),
        sa.Column('commission_amount', sa.Float(), nullable=False),
        sa.Column('net_amount', sa.Float(), nullable=False),
        sa.Column('confirmed_by_id', sa.Integer(), nullable=True),
        sa.Column('confirmed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['confirmed_by_id'], ['users.id']),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id']),
        sa.ForeignKeyConstraint(['engineer_id'], ['users.id']),
        sa.ForeignKeyConstraint(['request_id'], ['requests.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payment_records_created_at'), 'payment_records', ['created_at'], unique=False)
    op.create_index(op.f('ix_payment_records_customer_id'), 'payment_records', ['customer_id'], unique=False)
    op.create_index(op.f('ix_payment_records_engineer_id'), 'payment_records', ['engineer_id'], unique=False)
    op.create_index(op.f('ix_payment_records_request_id'), 'payment_records', ['request_id'], unique=False)
    op.create_index(op.f('ix_payment_records_status'), 'payment_records', ['status'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_payment_records_status'), table_name='payment_records')
    op.drop_index(op.f('ix_payment_records_request_id'), table_name='payment_records')
    op.drop_index(op.f('ix_payment_records_engineer_id'), table_name='payment_records')
    op.drop_index(op.f('ix_payment_records_customer_id'), table_name='payment_records')
    op.drop_index(op.f('ix_payment_records_created_at'), table_name='payment_records')
    op.drop_table('payment_records')
