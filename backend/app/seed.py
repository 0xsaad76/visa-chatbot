import asyncio
import json
from pathlib import Path

from sqlalchemy import delete

from app.database.session import AsyncSessionLocal
from app.models import VisaRequirement


async def seed_requirements() -> None:
    data_path = Path(__file__).resolve().parents[1] / "seeds" / "visa_requirements.json"
    rows = json.loads(data_path.read_text()) # converts the json file to a python list of dicts
    async with AsyncSessionLocal() as session: # this opens a temp connection to the db
        await session.execute(delete(VisaRequirement)) # deletes all the existing rows from the db
        session.add_all([VisaRequirement(**row) for row in rows]) # adds all the rows to the db
        await session.commit() # commits the changes
    print(f"Seeded {len(rows)} visa requirement records.")


if __name__ == "__main__":
    asyncio.run(seed_requirements())
