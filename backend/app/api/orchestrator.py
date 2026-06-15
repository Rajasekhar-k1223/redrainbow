from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.db.mysql import get_db
from app.models.asset import Asset
from app.tasks.scan_tasks import execute_nmap_scan

router = APIRouter(prefix="/api/v1/orchestrator", tags=["Orchestrator"])

@router.post("/scan/{asset_id}")
def trigger_scan(asset_id: str, x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Triggers an asynchronous scan for the given asset using Celery."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    # Verify asset exists and belongs to tenant
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.tenant_id == x_tenant_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Queue the Celery task
    task = execute_nmap_scan.delay(asset_id)
    
    return {
        "message": "Scan initiated",
        "task_id": task.id,
        "asset_id": asset_id
    }
