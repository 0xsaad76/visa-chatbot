from fastapi import APIRouter

from app.api.routes import auth, chat, dashboard, documents, eligibility, requirements

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(dashboard.router)
api_router.include_router(documents.router)
api_router.include_router(eligibility.router)
api_router.include_router(requirements.router)
