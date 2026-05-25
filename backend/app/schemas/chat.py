from uuid import UUID

from pydantic import BaseModel, Field


class Citation(BaseModel):
    title: str
    source_path: str
    snippet: str


class ConversationCreate(BaseModel):
    title: str = "Visa planning chat"
    destination_country: str | None = None
    applicant_profile: dict = Field(default_factory=dict)


class ConversationRead(BaseModel):
    id: UUID
    title: str
    destination_country: str | None
    applicant_profile: dict

    model_config = {"from_attributes": True}


class MessageRead(BaseModel):
    id: UUID
    role: str
    content: str
    citations: list[Citation] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    destination_country: str | None = None
    applicant_profile: dict = Field(default_factory=dict)


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
    suggested_questions: list[str]
