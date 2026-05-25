from collections.abc import AsyncIterator
from uuid import UUID

import orjson
from openai import APIError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.database.repositories.conversations import ConversationRepository
from app.models import Conversation, Message
from app.rag.embeddings import get_openai_client
from app.rag.prompts import build_chat_input, suggested_questions
from app.rag.retriever import retrieve_context
from app.schemas.chat import ChatRequest, ConversationCreate, ConversationRead


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.conversations = ConversationRepository(session)

    async def create_conversation(self, user_id: UUID, payload: ConversationCreate) -> ConversationRead:
        conversation = Conversation(
            user_id=user_id,
            title=payload.title,
            destination_country=payload.destination_country,
            applicant_profile=payload.applicant_profile,
        )
        await self.conversations.add(conversation)
        await self.session.commit()
        return ConversationRead.model_validate(conversation)

    async def list_conversations(self, user_id: UUID) -> list[ConversationRead]:
        conversations = await self.conversations.for_user(user_id)
        return [ConversationRead.model_validate(item) for item in conversations]

    async def stream_reply(self, user_id: UUID, conversation_id: UUID, payload: ChatRequest) -> AsyncIterator[str]:
        conversation = await self.conversations.get_for_user(conversation_id, user_id)
        if not conversation:
            yield self._event("error", {"message": "Conversation not found."})
            return

        await self.conversations.add_message(
            Message(conversation_id=conversation.id, role="user", content=payload.message, citations=[])
        )
        destination = payload.destination_country or conversation.destination_country
        profile = payload.applicant_profile or conversation.applicant_profile or {}
        context = await retrieve_context(self.session, payload.message, destination)
        citations = [
            {
                "title": item["title"],
                "source_path": item["source_path"],
                "snippet": item["content"][:220],
            }
            for item in context
        ]
        answer_parts: list[str] = []
        client = get_openai_client()
        settings = get_settings()

        yield self._event("citations", citations)
        try:
            if client is None:
                fallback = self._fallback_answer(destination, context)
                answer_parts.append(fallback)
                yield self._event("token", {"text": fallback})
            else:
                async with client.responses.stream(
                    model=settings.openai_model,
                    input=build_chat_input(payload.message, profile, context),
                ) as stream:
                    async for event in stream:
                        if event.type == "response.output_text.delta":
                            answer_parts.append(event.delta)
                            yield self._event("token", {"text": event.delta})
        except (APIError, AttributeError) as exc:
            fallback = f"I could not reach the AI model, but I found relevant guidance. {self._fallback_answer(destination, context)}"
            answer_parts.append(fallback)
            yield self._event("token", {"text": fallback, "warning": str(exc)})

        answer = "".join(answer_parts).strip()
        await self.conversations.add_message(
            Message(conversation_id=conversation.id, role="assistant", content=answer, citations=citations)
        )
        await self.session.commit()
        yield self._event("suggestions", suggested_questions(destination))
        yield self._event("done", {"ok": True})

    @staticmethod
    def _event(event: str, data: object) -> str:
        return f"event: {event}\ndata: {orjson.dumps(data).decode()}\n\n"

    @staticmethod
    def _fallback_answer(destination: str | None, context: list[dict]) -> str:
        country = destination or "your destination"
        if not context:
            return f"For {country}, start with passport validity, financial proof, itinerary, accommodation, and purpose-of-travel evidence."
        top = context[0]["content"][:500]
        return f"For {country}, the most relevant knowledge base note says: {top}"
