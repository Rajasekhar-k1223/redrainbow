from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey
from app.models.user import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(String(50), unique=True, index=True, nullable=False)
    target = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)
    logs = Column(Text, nullable=True) # Stored as newline-separated strings or JSON
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
