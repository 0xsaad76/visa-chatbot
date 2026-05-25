from uuid import UUID

from pydantic import BaseModel


class DocumentReport(BaseModel):
    document_type: str
    completeness_score: int
    missing_fields: list[str]
    detected_fields: list[str]
    recommendations: list[str]


class DocumentRead(BaseModel):
    id: UUID
    filename: str
    content_type: str
    document_type: str
    completeness_score: int
    missing_fields: list[str]
    validation_report: dict

    model_config = {"from_attributes": True}
