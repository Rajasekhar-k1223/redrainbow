from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime
from app.db.base import Base, TimestampMixin, TenantMixin, generate_uuid

class SiemLog(Base, TimestampMixin, TenantMixin):
    __tablename__ = "siem_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_ip = Column(String(45), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)
    severity = Column(String(20), nullable=False) # CRITICAL, HIGH, MEDIUM, LOW, INFO
    raw_payload = Column(JSON, nullable=True)
    message = Column(String(500), nullable=True)
