from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.repositories.base import Repository
from app.models import User


class UserRepository(Repository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)

    async def by_email(self, email: str) -> User | None:
        result = await self.session.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()
