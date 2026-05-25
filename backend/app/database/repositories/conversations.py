from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.repositories.base import Repository
from app.models import Conversation, Message


class ConversationRepository(Repository[Conversation]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Conversation)

    async def for_user(self, user_id: UUID) -> list[Conversation]:
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .options(selectinload(Conversation.messages))
        )
        return list(result.scalars().all())

    async def get_for_user(self, conversation_id: UUID, user_id: UUID) -> Conversation | None:
        result = await self.session.execute(
            select(Conversation)
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
            .options(selectinload(Conversation.messages))
        )
        return result.scalar_one_or_none()

    async def add_message(self, message: Message) -> Message:
        self.session.add(message)
        await self.session.flush()
        await self.session.refresh(message)
        return message
