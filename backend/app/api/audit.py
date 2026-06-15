from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.mysql import get_db
from app.models.audit import AuditLog

router = APIRouter(prefix="/api/v1/audit", tags=["Audit"])

@router.get("/")
def get_audit_logs(x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Fetch audit logs for a tenant."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="x-tenant-id header missing")
        
    logs = db.query(AuditLog).filter(AuditLog.tenant_id == x_tenant_id).order_by(AuditLog.timestamp.desc()).limit(100).all()
    
    return {
        "status": "success",
        "data": [
            {
                "id": log.id,
                "user": log.user,
                "action": log.action,
                "resource": log.resource,
                "details": log.details,
                "timestamp": log.timestamp.isoformat()
            } for log in logs
        ]
    }
