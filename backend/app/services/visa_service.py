from sqlalchemy.ext.asyncio import AsyncSession

from app.database.repositories.visa import VisaRepository
from app.schemas.visa import ChecklistItem, ChecklistRequest, ChecklistResponse, VisaRequirementRead


class VisaService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.visas = VisaRepository(session)

    async def list_requirements(self, destination: str | None = None) -> list[VisaRequirementRead]:
        items = await self.visas.requirements(destination)
        return [VisaRequirementRead.model_validate(item) for item in items]

    async def checklist(self, payload: ChecklistRequest) -> ChecklistResponse:
        requirements = await self.visas.requirements(payload.destination_country)
        match = next((item for item in requirements if item.visa_type.lower() == payload.visa_type.lower()), None)
        base_documents = match.required_documents if match else [
            "Passport",
            "Bank statements",
            "Travel itinerary",
            "Accommodation proof",
        ]
        items = [
            ChecklistItem(label=document, reason=f"Required for {payload.destination_country} {payload.visa_type} visa")
            for document in base_documents
        ]
        if payload.profile:
            if payload.profile.employment_status.lower() in {"employed", "self-employed", "business owner"}:
                items.append(ChecklistItem(label="Employment or business proof", reason="Supports economic ties."))
            if payload.profile.family_sponsorship.has_sponsor:
                items.append(ChecklistItem(label="Sponsor invitation and status proof", reason="Supports sponsorship claim."))
            if payload.profile.travel_purpose.lower() == "tourism":
                items.append(ChecklistItem(label="Day-by-day itinerary", reason="Clarifies short-term travel purpose."))
        return ChecklistResponse(
            destination_country=payload.destination_country,
            visa_type=payload.visa_type,
            items=items,
        )
