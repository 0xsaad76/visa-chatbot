from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.repositories.base import Repository
from app.models import Document


class DocumentRepository(Repository[Document]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Document)

    async def for_user(self, user_id: UUID) -> list[Document]:
        result = await self.session.execute(
            select(Document).where(Document.user_id == user_id).order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())
