from sqlalchemy import Column, String, Text, Boolean, Integer
from app.db.base import Base, TimestampMixin, TenantMixin, generate_uuid

class Evidence(Base, TimestampMixin, TenantMixin):
    __tablename__ = "evidence_vault"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(512), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    sha256 = Column(String(64), nullable=False, index=True) # Cryptographic integrity hash
    evidence_type = Column(String(50), nullable=False)
    source_vector = Column(String(100), nullable=True)
    uploaded_by = Column(String(100), nullable=False)
    is_tampered = Column(Boolean, default=False)
