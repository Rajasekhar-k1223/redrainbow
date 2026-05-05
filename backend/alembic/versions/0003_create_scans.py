"""create scans

Revision ID: 0003_create_scans
Revises: 0002_create_evidence
Create Date: 2026-03-27

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_create_scans'
down_revision = '0002_create_evidence'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'scans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('scan_id', sa.String(length=50), nullable=False),
        sa.Column('target', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('logs', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('scan_id')
    )
    op.create_index(op.f('ix_scans_id'), 'scans', ['id'], unique=False)
    op.create_index(op.f('ix_scans_scan_id'), 'scans', ['scan_id'], unique=True)

def downgrade():
    op.drop_index(op.f('ix_scans_scan_id'), table_name='scans')
    op.drop_index(op.f('ix_scans_id'), table_name='scans')
    op.drop_table('scans')
