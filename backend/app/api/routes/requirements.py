from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.schemas.visa import ChecklistRequest, ChecklistResponse, VisaRequirementRead
from app.services.visa_service import VisaService

router = APIRouter(prefix="/requirements", tags=["visa requirements"])


@router.get("", response_model=list[VisaRequirementRead])
async def list_requirements(session: AsyncSession = Depends(get_session)) -> list[VisaRequirementRead]:
    return await VisaService(session).list_requirements()


@router.get("/{destination}", response_model=list[VisaRequirementRead])
async def requirements_for_destination(
    destination: str,
    session: AsyncSession = Depends(get_session),
) -> list[VisaRequirementRead]:
    return await VisaService(session).list_requirements(destination)


@router.post("/checklist", response_model=ChecklistResponse)
async def generate_checklist(
    payload: ChecklistRequest,
    session: AsyncSession = Depends(get_session),
) -> ChecklistResponse:
    return await VisaService(session).checklist(payload)
