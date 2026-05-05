from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Text, ForeignKey, Boolean
from app.models.user import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(512), nullable=True)
    sha256 = Column(String(64), nullable=True) # Forensic integrity hash
    evidence_type = Column(String(50), nullable=False)
    severity = Column(String(20), default="Info") # Critical, High, Med, Low, Info
    source_vector = Column(String(100), nullable=True) # e.g. 'Nmap-Phase-7'
    forensic_data = Column(Text, nullable=True) # JSON store for forensic details
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
