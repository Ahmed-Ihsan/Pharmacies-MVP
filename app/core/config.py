from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    DATABASE_URL: str = "sqlite:///./data/pharmacy.db"
    SECRET_KEY: str = "pharmacy-management-secret-key-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DEBUG: bool = True
    
    # SQLite specific settings
    SQLITE_POOL_SIZE: int = 1
    SQLITE_MAX_OVERFLOW: int = 0
    
    @property
    def sync_database_url(self) -> str:
        return self.DATABASE_URL


settings = Settings()
