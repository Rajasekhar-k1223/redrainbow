from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=8)


class UserOut(BaseModel):
    id: int
    username: str

    model_config = ConfigDict(from_attributes=True)


class EvidenceBase(BaseModel):
    title: str
    description: str | None = None
    evidence_type: str
    file_path: str | None = None


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceOut(EvidenceBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
