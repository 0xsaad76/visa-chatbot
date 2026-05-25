from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_user
from app.database.session import get_session
from app.models import Conversation, Document, EligibilityAssessment, User
from app.schemas.dashboard import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def summary(
    user: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> DashboardSummary:
    assessments_count = await session.scalar(
        select(func.count()).select_from(EligibilityAssessment).where(EligibilityAssessment.user_id == user.id)
    )
    documents_count = await session.scalar(select(func.count()).select_from(Document).where(Document.user_id == user.id))
    conversations_count = await session.scalar(
        select(func.count()).select_from(Conversation).where(Conversation.user_id == user.id)
    )
    average_score = await session.scalar(
        select(func.avg(EligibilityAssessment.eligibility_score)).where(EligibilityAssessment.user_id == user.id)
    )
    recent_assessment = await session.execute(
        select(EligibilityAssessment)
        .where(EligibilityAssessment.user_id == user.id)
        .order_by(EligibilityAssessment.created_at.desc())
        .limit(3)
    )
    return DashboardSummary(
        assessments_count=assessments_count or 0,
        documents_count=documents_count or 0,
        conversations_count=conversations_count or 0,
        average_eligibility_score=int(average_score or 0),
        checklist_completion_percentage=0,
        recent_activity=[
            {
                "type": "assessment",
                "score": item.eligibility_score,
                "probability": item.approval_probability,
                "created_at": item.created_at.isoformat(),
            }
            for item in recent_assessment.scalars().all()
        ],
    )
