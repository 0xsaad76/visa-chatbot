from pydantic import BaseModel


class DashboardSummary(BaseModel):
    assessments_count: int
    documents_count: int
    conversations_count: int
    average_eligibility_score: int
    checklist_completion_percentage: int
    recent_activity: list[dict]
