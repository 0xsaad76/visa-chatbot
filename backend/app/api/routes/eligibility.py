from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.database.session import get_session
from app.models import User
from app.schemas.eligibility import EligibilityResult, VisaProfileCreate
from app.services.eligibility_service import EligibilityService

router = APIRouter(prefix="/eligibility", tags=["eligibility"])


@router.post("/assessments", response_model=EligibilityResult)
async def create_assessment(
    payload: VisaProfileCreate,
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> EligibilityResult:
    return await EligibilityService(session).assess(user.id, payload)


@router.get("/assessments", response_model=list[EligibilityResult])
async def list_assessments(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> list[EligibilityResult]:
    return await EligibilityService(session).list_for_user(user.id)
