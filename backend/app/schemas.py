from pydantic import BaseModel
from typing import Optional

class IncidentCreate(BaseModel):
    title: str
    severity: str
    asset_id: Optional[str] = None
    summary: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    tenant_id: str
    title: str
    severity: str
    asset_id: Optional[str]
    status: str
    summary: Optional[str]

    class Config:
        from_attributes = True
