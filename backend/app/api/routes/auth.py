from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.database.session import get_session
from app.models import User
from app.schemas.auth import Token, UserCreate, UserLogin, UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, session: AsyncSession = Depends(get_session)) -> Token:
    try:
        return await AuthService(session).register(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, session: AsyncSession = Depends(get_session)) -> Token:
    try:
        return await AuthService(session).login(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(current_user)) -> UserRead:
    return UserRead.model_validate(user)
