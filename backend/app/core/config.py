import os

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Settings(BaseModel):
    app_name: str = "RedRainbow API"
    database_url: str = os.getenv("DATABASE_URL", "mysql+pymysql://user:pass@localhost:3306/redrainbow")
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/redrainbow")
    redis_url: str = os.getenv("REDIS_URL", "redis://:password@localhost:6379/0")
    jwt_secret: str = os.getenv("JWT_SECRET", "CHANGE_ME")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    rate_limit_per_minute: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "300"))
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")


settings = Settings()