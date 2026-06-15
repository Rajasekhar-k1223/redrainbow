from sqlalchemy import Column, String, Text
from app.db.base import Base, TimestampMixin, TenantMixin, generate_uuid

class Incident(Base, TimestampMixin, TenantMixin):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(20), nullable=False, index=True)
    status = Column(String(50), default="New", index=True) # New, In Progress, Closed
    assigned_to = Column(String(36)) # User ID
    summary = Column(Text) # AI summary
