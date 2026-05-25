from uuid import UUID

from pydantic import BaseModel, Field


class FamilySponsorship(BaseModel):
    has_sponsor: bool = False
    relationship: str | None = None
    sponsor_status: str | None = None


class VisaProfileCreate(BaseModel):
    nationality: str
    destination_country: str
    travel_purpose: str
    employment_status: str
    annual_income: int = Field(ge=0)
    travel_history: str = ""
    family_sponsorship: FamilySponsorship = Field(default_factory=FamilySponsorship)


class EligibilityResult(BaseModel):
    id: UUID | None = None
    profile_id: UUID | None = None
    eligibility_score: int
    approval_probability: str
    risk_factors: list[str]
    recommendations: list[str]

    model_config = {"from_attributes": True}
