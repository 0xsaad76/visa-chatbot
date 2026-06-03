from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Visa Assistant"
    api_prefix: str = "/api"
    database_url: str = "postgresql+asyncpg://visa:visa_password@localhost:5432/visa_assistant"
    openai_api_key: str | None = None
    openai_model: str = "gpt-5.2"
    openai_embedding_model: str = "text-embedding-3-small"
    jwt_secret: str = "secretty"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 1440
    backend_cors_origins: list[AnyHttpUrl | str] = Field(default_factory=lambda: ["http://localhost:3000"])

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
