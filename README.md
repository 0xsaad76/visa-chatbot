# AI Visa Assistant

A production-oriented full-stack portfolio project for a visa consultancy company. It combines a Next.js 15 dashboard with a FastAPI backend, PostgreSQL + pgvector storage, JWT auth, OpenAI-powered RAG chat, eligibility scoring, personalized checklists, and PDF document verification.

<img width="1678" height="873" alt="image" src="https://github.com/user-attachments/assets/def45dd2-1ac5-4a56-9597-a648045af585" />

https://app.eraser.io/workspace/ihQltdKfPG63e7AYyrya?origin=share

## Stack

- Frontend: Next.js 15, TypeScript, TailwindCSS, shadcn-style UI primitives
- Backend: Python FastAPI, async SQLAlchemy, Alembic
- Database: PostgreSQL with pgvector
- AI: OpenAI Responses API + embeddings
- Auth: JWT bearer tokens
- Deployment: Docker Compose

## Quick Start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Add your `OPENAI_API_KEY`.

3. Start the stack:

```bash
docker compose up --build
```

4. Apply migrations and seed visa requirements:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```

5. Open:

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

## Local Development

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Architecture

The backend follows a service/repository shape:

- `app/api`: FastAPI routers and request dependencies
- `app/services`: application use cases
- `app/database/repositories`: persistence adapters
- `app/models`: SQLAlchemy ORM models
- `app/schemas`: Pydantic API contracts
- `app/rag`: ingestion, embeddings, retrieval, prompts
- `app/document_processing`: PDF extraction, classification, validation
- `app/eligibility_engine`: scoring logic

The frontend uses typed API calls from `src/lib/api.ts`, route-specific client components, and shared UI primitives under `src/components/ui`.

## Core API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/requirements`
- `GET /api/requirements/{destination}`
- `POST /api/requirements/checklist`
- `POST /api/eligibility/assessments`
- `GET /api/eligibility/assessments`
- `POST /api/chat/conversations`
- `GET /api/chat/conversations`
- `POST /api/chat/conversations/{id}/stream`
- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/dashboard/summary`

## RAG Ingestion

Markdown files in `backend/kb` can be ingested with:

```bash
python -m app.rag.ingestion backend/kb
```

PDF ingestion is supported by the same pipeline when `pypdf` can extract text.

## Notes

This project is designed as a strong professional portfolio baseline. It includes real persistence, migrations, JWT auth, streaming chat, RAG retrieval hooks, document validation logic, Docker files, and representative data. Production deployments should add managed secrets, object storage for document files, rate limits, monitoring, and legal review of visa advice disclaimers.
