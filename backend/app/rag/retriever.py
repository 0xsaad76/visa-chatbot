from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import KnowledgeChunk
from app.rag.embeddings import embed_text


async def retrieve_context(session: AsyncSession, query: str, destination: str | None, limit: int = 5) -> list[dict]:
    embedding = await embed_text(query)
    statement = select(KnowledgeChunk)
    if destination:
        statement = statement.where(KnowledgeChunk.destination_country.ilike(destination))
    if embedding:
        statement = statement.order_by(KnowledgeChunk.embedding.cosine_distance(embedding))  # type: ignore[attr-defined]
    else:
        statement = statement.order_by(KnowledgeChunk.created_at.desc())
    result = await session.execute(statement.limit(limit))
    return [
        {
            "title": chunk.source_title,
            "source_path": chunk.source_path,
            "content": chunk.content,
        }
        for chunk in result.scalars().all()
    ]
