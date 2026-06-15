from sqlalchemy import Column, String, JSON
from app.db.base import Base, TimestampMixin, TenantMixin, generate_uuid

class Asset(Base, TimestampMixin, TenantMixin):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    asset_type = Column(String(50), nullable=False, index=True) # domain, server, container, cloud, api
    identifier = Column(String(255), nullable=False, index=True)
    criticality = Column(String(50), default="Medium") # High, Medium, Low
    owner = Column(String(255))
    environment = Column(String(50)) # prod, staging, dev
    tags = Column(JSON) # List of tags
