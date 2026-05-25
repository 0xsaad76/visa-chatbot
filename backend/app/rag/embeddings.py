from openai import AsyncOpenAI

from app.core.config import get_settings


def get_openai_client() -> AsyncOpenAI | None:
    settings = get_settings()
    if not settings.openai_api_key:
        return None
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def embed_text(text: str) -> list[float] | None:
    settings = get_settings()
    client = get_openai_client()
    if client is None:
        return None
    response = await client.embeddings.create(model=settings.openai_embedding_model, input=text[:8000])
    return response.data[0].embedding
