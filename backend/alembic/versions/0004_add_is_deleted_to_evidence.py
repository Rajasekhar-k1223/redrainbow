"""add is_deleted to evidence

Revision ID: 0004_add_is_deleted_to_evidence
Revises: 0003_create_scans
Create Date: 2026-03-27

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0004_add_is_deleted_to_evidence'
down_revision = '0003_create_scans'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_deleted column to evidence table
    op.add_column('evidence', sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.sql.expression.false()))


def downgrade():
    op.drop_column('evidence', 'is_deleted')
