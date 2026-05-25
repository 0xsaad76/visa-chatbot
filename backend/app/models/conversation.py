from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin


class Conversation(Base, IdMixin, TimestampMixin):
    __tablename__ = "conversations"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180), default="Visa planning chat")
    destination_country: Mapped[str | None] = mapped_column(String(80), nullable=True)
    applicant_profile: Mapped[dict] = mapped_column(JSONB, default=dict)

    user: Mapped["User"] = relationship(back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")


class Message(Base, IdMixin, TimestampMixin):
    __tablename__ = "messages"

    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String(24))
    content: Mapped[str] = mapped_column(Text)
    citations: Mapped[list] = mapped_column(JSONB, default=list)

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
