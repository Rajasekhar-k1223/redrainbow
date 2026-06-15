import enum
from sqlalchemy import Column, String, Boolean, Enum
from app.db.base import Base, TimestampMixin, TenantMixin, generate_uuid

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "Super Admin"
    SECURITY_ADMIN = "Security Admin"
    SOC_ANALYST = "SOC Analyst"
    THREAT_HUNTER = "Threat Hunter"
    INCIDENT_RESPONDER = "Incident Responder"
    AUDITOR = "Auditor"
    VIEWER = "Viewer"

class User(Base, TimestampMixin, TenantMixin):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    mfa_secret = Column(String(32), nullable=True) # Base32 TOTP secret
    mfa_enabled = Column(Boolean, default=False, nullable=False)
