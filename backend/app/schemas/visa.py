from uuid import UUID

from pydantic import BaseModel

from app.schemas.eligibility import VisaProfileCreate


class VisaRequirementRead(BaseModel):
    id: UUID
    destination_country: str
    visa_type: str
    processing_time: str
    visa_fee: str
    required_documents: list[str]
    eligibility_rules: list[str]
    application_steps: list[str]
    notes: str

    model_config = {"from_attributes": True}


class ChecklistRequest(BaseModel):
    destination_country: str
    visa_type: str = "Tourist"
    profile: VisaProfileCreate | None = None


class ChecklistItem(BaseModel):
    label: str
    reason: str
    required: bool = True
    completed: bool = False


class ChecklistResponse(BaseModel):
    destination_country: str
    visa_type: str
    completion_percentage: int = 0
    items: list[ChecklistItem]
