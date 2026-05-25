"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-05-25
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "users",
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=40), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "visa_requirements",
        sa.Column("destination_country", sa.String(length=80), nullable=False),
        sa.Column("visa_type", sa.String(length=80), nullable=False),
        sa.Column("processing_time", sa.String(length=120), nullable=False),
        sa.Column("visa_fee", sa.String(length=120), nullable=False),
        sa.Column("required_documents", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("eligibility_rules", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("application_steps", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_requirements_destination_type", "visa_requirements", ["destination_country", "visa_type"])

    op.create_table(
        "knowledge_chunks",
        sa.Column("destination_country", sa.String(length=80), nullable=False),
        sa.Column("source_title", sa.String(length=180), nullable=False),
        sa.Column("source_path", sa.String(length=400), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", Vector(1536), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_knowledge_chunks_destination_country"), "knowledge_chunks", ["destination_country"])

    op.create_table(
        "conversations",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("destination_country", sa.String(length=80), nullable=True),
        sa.Column("applicant_profile", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_conversations_user_id"), "conversations", ["user_id"])

    op.create_table(
        "documents",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=False),
        sa.Column("document_type", sa.String(length=80), nullable=False),
        sa.Column("text_excerpt", sa.Text(), nullable=False),
        sa.Column("completeness_score", sa.Integer(), nullable=False),
        sa.Column("missing_fields", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("validation_report", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_documents_user_id"), "documents", ["user_id"])

    op.create_table(
        "visa_profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("nationality", sa.String(length=80), nullable=False),
        sa.Column("destination_country", sa.String(length=80), nullable=False),
        sa.Column("travel_purpose", sa.String(length=80), nullable=False),
        sa.Column("employment_status", sa.String(length=80), nullable=False),
        sa.Column("annual_income", sa.Integer(), nullable=False),
        sa.Column("travel_history", sa.Text(), nullable=False),
        sa.Column("family_sponsorship", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_visa_profiles_destination_country"), "visa_profiles", ["destination_country"])
    op.create_index(op.f("ix_visa_profiles_user_id"), "visa_profiles", ["user_id"])

    op.create_table(
        "messages",
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(length=24), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("citations", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_messages_conversation_id"), "messages", ["conversation_id"])

    op.create_table(
        "eligibility_assessments",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("profile_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("eligibility_score", sa.Integer(), nullable=False),
        sa.Column("approval_probability", sa.String(length=40), nullable=False),
        sa.Column("risk_factors", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("recommendations", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["profile_id"], ["visa_profiles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_eligibility_assessments_profile_id"), "eligibility_assessments", ["profile_id"])
    op.create_index(op.f("ix_eligibility_assessments_user_id"), "eligibility_assessments", ["user_id"])


def downgrade() -> None:
    op.drop_table("eligibility_assessments")
    op.drop_table("messages")
    op.drop_table("visa_profiles")
    op.drop_table("documents")
    op.drop_table("conversations")
    op.drop_table("knowledge_chunks")
    op.drop_table("visa_requirements")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS vector")
