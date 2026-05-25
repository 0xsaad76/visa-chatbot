from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

ModelT = TypeVar("ModelT")


class Repository(Generic[ModelT]):
    def __init__(self, session: AsyncSession, model: type[ModelT]):
        self.session = session
        self.model = model

    async def get(self, entity_id: UUID) -> ModelT | None:
        return await self.session.get(self.model, entity_id)

    async def list(self, limit: int = 50) -> list[ModelT]:
        result = await self.session.execute(select(self.model).limit(limit))
        return list(result.scalars().all())

    async def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity
