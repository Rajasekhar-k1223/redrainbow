from sqlalchemy import Column, String
from app.db.base import Base, TimestampMixin, generate_uuid

class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False, index=True)
