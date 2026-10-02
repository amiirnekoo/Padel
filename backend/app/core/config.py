import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "Padel & Tennis Court Booking Engine"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    ALLOW_DEV_AUTH_BYPASS: bool = os.getenv("ALLOW_DEV_AUTH_BYPASS", "false").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-padel-jwt-key-for-development-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./padel.db")
    
    # Business Rules (From Clarifications Session 2026-09-22)
    HOLD_EXPIRATION_MINUTES: int = 10
    CANCELLATION_DEADLINE_HOURS: int = 24
    CANCELLATION_PENALTY_PERCENT: int = 10
    CANCELLATION_REFUND_PERCENT: int = 90
    
    # Platform Defaults
    DEFAULT_COMMISSION_RATE: float = 3.00

    # Production Integrations & Gateways
    PAYMENT_GATEWAY_PROVIDER: str = os.getenv("PAYMENT_GATEWAY_PROVIDER", "MOCK")
    ZARINPAL_MERCHANT_ID: str = os.getenv("ZARINPAL_MERCHANT_ID", "00000000-0000-0000-0000-000000000000")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SMS_PROVIDER: str = os.getenv("SMS_PROVIDER", "mock")

    # Media & File Uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE_MB: int = 15

settings = Settings()
