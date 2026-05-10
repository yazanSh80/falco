"""cleanup non electrical catalog

Revision ID: e1b2c3d4f5a6
Revises: d2f6a9b1c340
Create Date: 2026-05-06 00:00:00.000000
"""
from alembic import op


revision = 'e1b2c3d4f5a6'
down_revision = 'd2f6a9b1c340'
branch_labels = None
depends_on = None


NON_ELECTRICAL_FEATURES = ('Plumbing', 'Carpentry', 'Alumetal', 'Furniture Cleaning')
NON_ELECTRICAL_SERVICE_IDS = ('S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S13', 'S14', 'S15', 'S16')


def upgrade():
    op.execute(
        """
        UPDATE services
        SET active = 0,
            is_visible = 0,
            is_core = 0,
            domain = 'legacy',
            service_kind = 'legacy_service',
            pricing_mode = 'not_applicable'
        WHERE id IN ('S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S13', 'S14', 'S15', 'S16')
           OR feature_id IN (
                SELECT id FROM features
                WHERE name IN ('Plumbing', 'Carpentry', 'Alumetal', 'Furniture Cleaning')
           )
        """
    )
    op.execute(
        """
        UPDATE features
        SET active = 0
        WHERE name IN ('Plumbing', 'Carpentry', 'Alumetal', 'Furniture Cleaning')
        """
    )


def downgrade():
    op.execute(
        """
        UPDATE features
        SET active = 1
        WHERE name IN ('Plumbing', 'Carpentry', 'Alumetal', 'Furniture Cleaning')
        """
    )
    op.execute(
        """
        UPDATE services
        SET active = 1,
            is_visible = 1,
            is_core = 1
        WHERE id IN ('S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S13', 'S14', 'S15', 'S16')
        """
    )
