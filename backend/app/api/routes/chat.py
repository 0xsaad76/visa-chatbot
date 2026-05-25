from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.database.session import get_session
from app.models import User
from app.schemas.chat import ChatRequest, ConversationCreate, ConversationRead
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/conversations", response_model=ConversationRead)
async def create_conversation(
    payload: ConversationCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> ConversationRead:
    return await ChatService(session).create_conversation(user.id, payload)


@router.get("/conversations", response_model=list[ConversationRead])
async def list_conversations(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ConversationRead]:
    return await ChatService(session).list_conversations(user.id)


@router.post("/conversations/{conversation_id}/stream")
async def stream_chat(
    conversation_id: UUID,
    payload: ChatRequest,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> StreamingResponse:
    service = ChatService(session)
    return StreamingResponse(
        service.stream_reply(user.id, conversation_id, payload),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
