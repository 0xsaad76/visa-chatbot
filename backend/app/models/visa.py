from app.models import User
from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.models.base import Base, IdMixin, TimestampMixin


class VisaProfile(Base, IdMixin, TimestampMixin):
    __tablename__ = "visa_profiles"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    nationality: Mapped[str] = mapped_column(String(80))
    destination_country: Mapped[str] = mapped_column(String(80), index=True)
    travel_purpose: Mapped[str] = mapped_column(String(80))
    employment_status: Mapped[str] = mapped_column(String(80))
    annual_income: Mapped[int] = mapped_column(Integer)
    travel_history: Mapped[str] = mapped_column(Text, default="")
    family_sponsorship: Mapped[dict] = mapped_column(JSONB, default=dict)

    user: Mapped[User] = relationship(back_populates="profiles")
    assessments: Mapped[list["EligibilityAssessment"]] = relationship(back_populates="profile", cascade="all, delete-orphan")


class EligibilityAssessment(Base, IdMixin, TimestampMixin):
    __tablename__ = "eligibility_assessments"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    profile_id: Mapped[UUID] = mapped_column(ForeignKey("visa_profiles.id", ondelete="CASCADE"), index=True)
    eligibility_score: Mapped[int] = mapped_column(Integer)
    approval_probability: Mapped[str] = mapped_column(String(40))
    risk_factors: Mapped[list] = mapped_column(JSONB, default=list)
    recommendations: Mapped[list] = mapped_column(JSONB, default=list)

    profile: Mapped[VisaProfile] = relationship(back_populates="assessments")


class VisaRequirement(Base, IdMixin, TimestampMixin):
    __tablename__ = "visa_requirements"

    destination_country: Mapped[str] = mapped_column(String(80), index=True)
    visa_type: Mapped[str] = mapped_column(String(80), index=True)
    processing_time: Mapped[str] = mapped_column(String(120))
    visa_fee: Mapped[str] = mapped_column(String(120))
    required_documents: Mapped[list] = mapped_column(JSONB, default=list)
    eligibility_rules: Mapped[list] = mapped_column(JSONB, default=list)
    application_steps: Mapped[list] = mapped_column(JSONB, default=list)
    notes: Mapped[str] = mapped_column(Text, default="")


class KnowledgeChunk(Base, IdMixin, TimestampMixin):
    __tablename__ = "knowledge_chunks"

    destination_country: Mapped[str] = mapped_column(String(80), index=True)
    source_title: Mapped[str] = mapped_column(String(180))
    source_path: Mapped[str] = mapped_column(String(400))
    content: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(1536), nullable=True)
