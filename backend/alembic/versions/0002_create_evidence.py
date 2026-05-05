"""create evidence table

Revision ID: 0002_create_evidence
Revises: 0001_create_users
Create Date: 2026-03-27
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_create_evidence"
down_revision = "0001_create_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "evidence",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("file_path", sa.String(length=512), nullable=True),
        sa.Column("evidence_type", sa.String(length=50), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evidence_id'), 'evidence', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_evidence_id'), table_name='evidence')
    op.drop_table("evidence")
