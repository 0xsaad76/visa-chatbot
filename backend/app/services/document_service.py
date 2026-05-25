from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.repositories.documents import DocumentRepository
from app.document_processing.classifier import classify_document
from app.document_processing.extractor import extract_pdf_text
from app.document_processing.validator import validate_document
from app.models import Document
from app.schemas.document import DocumentRead


class DocumentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.documents = DocumentRepository(session)

    async def upload(self, user_id: UUID, file: UploadFile) -> DocumentRead:
        content = await file.read()
        if file.content_type != "application/pdf":
            raise ValueError("Only PDF uploads are supported.")
        text = extract_pdf_text(content)
        document_type = classify_document(text)
        report = validate_document(document_type, text)
        document = Document(
            user_id=user_id,
            filename=file.filename or "uploaded.pdf",
            content_type=file.content_type,
            document_type=document_type,
            text_excerpt=text[:1200],
            completeness_score=report["completeness_score"],
            missing_fields=report["missing_fields"],
            validation_report=report,
        )
        await self.documents.add(document)
        await self.session.commit()
        return DocumentRead.model_validate(document)

    async def list_for_user(self, user_id: UUID) -> list[DocumentRead]:
        items = await self.documents.for_user(user_id)
        return [DocumentRead.model_validate(item) for item in items]
