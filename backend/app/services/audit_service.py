import logging
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

logger = logging.getLogger(__name__)

def log_action(db: Session, tenant_id: str, user: str, action: str, resource: str, details: str = None):
    """
    Records an immutable audit log entry.
    """
    try:
        audit_entry = AuditLog(
            tenant_id=tenant_id,
            user=user,
            action=action,
            resource=resource,
            details=details
        )
        db.add(audit_entry)
        db.commit()
        logger.info(f"AUDIT LOG: {user} performed {action} on {resource} (Tenant: {tenant_id})")
    except Exception as e:
        logger.error(f"Failed to write audit log: {str(e)}")
        db.rollback()
