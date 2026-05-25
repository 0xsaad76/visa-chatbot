from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.database.repositories.users import UserRepository
from app.models import User
from app.schemas.auth import Token, UserCreate, UserLogin, UserRead


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.users = UserRepository(session)

    async def register(self, payload: UserCreate) -> Token:
        existing = await self.users.by_email(payload.email)
        if existing:
            raise ValueError("An account with this email already exists.")
        user = User(
            email=payload.email.lower(),
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
        )
        await self.users.add(user)
        await self.session.commit()
        return Token(access_token=create_access_token(user.id), user=UserRead.model_validate(user))

    async def login(self, payload: UserLogin) -> Token:
        user = await self.users.by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise ValueError("Invalid email or password.")
        return Token(access_token=create_access_token(user.id), user=UserRead.model_validate(user))
