from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.db.mysql import get_db
from app.services.compliance_service import calculate_compliance_report

router = APIRouter(prefix="/api/v1/compliance", tags=["Compliance"])

@router.get("/report")
def get_compliance_report(x_tenant_id: str = Header(...), db: Session = Depends(get_db)):
    """Fetches the dynamically calculated compliance readiness report."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID is required")
        
    report = calculate_compliance_report(db, x_tenant_id)
    return report
