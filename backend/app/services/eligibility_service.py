from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.database.repositories.visa import VisaRepository
from app.eligibility_engine.scoring import score_profile
from app.models import EligibilityAssessment, VisaProfile
from app.schemas.eligibility import EligibilityResult, VisaProfileCreate


class EligibilityService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.visas = VisaRepository(session)

    async def assess(self, user_id: UUID, payload: VisaProfileCreate) -> EligibilityResult:
        score = score_profile(payload)
        profile = await self.visas.create_profile(
            VisaProfile(
                user_id=user_id,
                nationality=payload.nationality,
                destination_country=payload.destination_country,
                travel_purpose=payload.travel_purpose,
                employment_status=payload.employment_status,
                annual_income=payload.annual_income,
                travel_history=payload.travel_history,
                family_sponsorship=payload.family_sponsorship.model_dump(),
            )
        )
        assessment = await self.visas.create_assessment(
            EligibilityAssessment(
                user_id=user_id,
                profile_id=profile.id,
                eligibility_score=score.eligibility_score,
                approval_probability=score.approval_probability,
                risk_factors=score.risk_factors,
                recommendations=score.recommendations,
            )
        )
        await self.session.commit()
        return EligibilityResult.model_validate(assessment)

    async def list_for_user(self, user_id: UUID) -> list[EligibilityResult]:
        assessments = await self.visas.assessments_for_user(user_id)
        return [EligibilityResult.model_validate(item) for item in assessments]
