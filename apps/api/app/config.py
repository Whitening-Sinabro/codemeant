import os
from functools import lru_cache

from pydantic import BaseModel


class Settings(BaseModel):
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    polar_webhook_secret: str = os.getenv("POLAR_WEBHOOK_SECRET", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()
