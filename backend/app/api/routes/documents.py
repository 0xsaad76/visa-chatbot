from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.database.session import get_session
from app.models import User
from app.schemas.document import DocumentRead
from app.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> DocumentRead:
    try:
        return await DocumentService(session).upload(user.id, file)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("", response_model=list[DocumentRead])
async def list_documents(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> list[DocumentRead]:
    return await DocumentService(session).list_for_user(user.id)
