import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    user = Column(String(255), nullable=False) # E.g., admin@acme.corp or SYSTEM
    action = Column(String(100), nullable=False, index=True) # E.g., PLAYBOOK_EXECUTE
    resource = Column(String(255), nullable=False) # E.g., Incident ID or Playbook ID
    details = Column(Text, nullable=True) # Additional context/JSON
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
