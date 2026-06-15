from sqlalchemy import Column, String, DateTime
from datetime import datetime
from app.db.base import Base, TimestampMixin, TenantMixin, generate_uuid

class MonitorixAgent(Base, TimestampMixin, TenantMixin):
    __tablename__ = "monitorix_agents"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    hostname = Column(String(255), nullable=False)
    os_version = Column(String(100), nullable=False)
    ip_address = Column(String(45), nullable=False)
    status = Column(String(50), default="Online") # Online, Offline, Tampered
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
