import asyncio
import json
from pathlib import Path

from sqlalchemy import delete

from app.database.session import AsyncSessionLocal
from app.models import VisaRequirement


async def seed_requirements() -> None:
    data_path = Path(__file__).resolve().parents[1] / "seeds" / "visa_requirements.json"
    rows = json.loads(data_path.read_text())
    async with AsyncSessionLocal() as session:
        await session.execute(delete(VisaRequirement))
        session.add_all([VisaRequirement(**row) for row in rows])
        await session.commit()
    print(f"Seeded {len(rows)} visa requirement records.")


if __name__ == "__main__":
    asyncio.run(seed_requirements())
