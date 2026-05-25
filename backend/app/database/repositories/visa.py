from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.repositories.base import Repository
from app.models import EligibilityAssessment, VisaProfile, VisaRequirement


class VisaRepository(Repository[VisaRequirement]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, VisaRequirement)

    async def requirements(self, destination: str | None = None) -> list[VisaRequirement]:
        statement = select(VisaRequirement).order_by(VisaRequirement.destination_country, VisaRequirement.visa_type)
        if destination:
            statement = statement.where(func.lower(VisaRequirement.destination_country) == destination.lower())
        result = await self.session.execute(statement)
        return list(result.scalars().all())

    async def create_profile(self, profile: VisaProfile) -> VisaProfile:
        self.session.add(profile)
        await self.session.flush()
        await self.session.refresh(profile)
        return profile

    async def create_assessment(self, assessment: EligibilityAssessment) -> EligibilityAssessment:
        self.session.add(assessment)
        await self.session.flush()
        await self.session.refresh(assessment)
        return assessment

    async def assessments_for_user(self, user_id: UUID) -> list[EligibilityAssessment]:
        result = await self.session.execute(
            select(EligibilityAssessment)
            .where(EligibilityAssessment.user_id == user_id)
            .order_by(EligibilityAssessment.created_at.desc())
        )
        return list(result.scalars().all())
