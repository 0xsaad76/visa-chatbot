import asyncio
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import AsyncSessionLocal
from app.models import KnowledgeChunk
from app.rag.embeddings import embed_text


# this splits large texts into smaller chunks, these chunks are then embedded
# which are converted to vectors to find the most relevant information.
def chunk_text(text: str, size: int = 1100, overlap: int = 160) -> list[str]:
    clean = " ".join(text.split())
    chunks = []
    start = 0
    while start < len(clean):
        chunks.append(clean[start : start + size])
        start += size - overlap
    return chunks


def infer_destination(path: Path) -> str:
    stem = path.stem.replace("-", " ").replace("_", " ").title()
    return "United States" if stem.lower() in {"usa", "us"} else stem


# this reads file and embeds it
async def ingest_file(session: AsyncSession, path: Path) -> int:
    text = path.read_text(errors="ignore")
    destination = infer_destination(path)
    count = 0
    for index, chunk in enumerate(chunk_text(text)):
        embedding = await embed_text(chunk)
        session.add(
            KnowledgeChunk(
                destination_country=destination,
                source_title=f"{destination} knowledge base {index + 1}",
                source_path=str(path),
                content=chunk,
                embedding=embedding,
            )
        )
        count += 1
    return count


async def ingest_directory(directory: str) -> None:
    async with AsyncSessionLocal() as session:
        total = 0
        for path in Path(directory).glob("*.md"):
            total += await ingest_file(session, path)
        await session.commit()
    print(f"Ingested {total} knowledge chunks.")


if __name__ == "__main__":
    import sys

    target = sys.argv[1] if len(sys.argv) > 1 else "backend/kb"
    asyncio.run(ingest_directory(target))
