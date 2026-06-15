from sqlalchemy import Column, String, Text, ForeignKey
from app.db.base import Base, TimestampMixin, TenantMixin, generate_uuid

class Finding(Base, TimestampMixin, TenantMixin):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    asset_id = Column(String(36), ForeignKey('assets.id', ondelete='CASCADE'), nullable=False, index=True)
    scan_id = Column(String(36), index=True) # Can link to a scan run
    severity = Column(String(20), nullable=False, index=True) # Critical, High, Medium, Low, Info
    title = Column(String(255), nullable=False)
    description = Column(Text)
    remediation = Column(Text)
    status = Column(String(50), default="Open", index=True) # Open, Closed, Risk Accepted
