from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin


class Document(Base, IdMixin, TimestampMixin):
    __tablename__ = "documents"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(120))
    document_type: Mapped[str] = mapped_column(String(80))
    text_excerpt: Mapped[str] = mapped_column(Text, default="")
    completeness_score: Mapped[int] = mapped_column(Integer, default=0)
    missing_fields: Mapped[list] = mapped_column(JSONB, default=list)
    validation_report: Mapped[dict] = mapped_column(JSONB, default=dict)

    user: Mapped["User"] = relationship(back_populates="documents")
