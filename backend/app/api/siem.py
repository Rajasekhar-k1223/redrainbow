from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.db.mysql import get_db
from app.models.siem import SiemLog
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/siem", tags=["SIEM"])

class SiemIngestPayload(BaseModel):
    source_ip: Optional[str] = None
    event_type: str
    severity: str
    message: Optional[str] = None
    raw_payload: Optional[Dict[str, Any]] = None

@router.post("/ingest")
def ingest_log(payload: SiemIngestPayload, x_tenant_id: str = Header(...), db: Session = Depends(get_db)):
    """High-throughput SIEM log ingestion endpoint."""
    
    valid_severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
    if payload.severity.upper() not in valid_severities:
        payload.severity = "INFO"
        
    log_entry = SiemLog(
        source_ip=payload.source_ip,
        event_type=payload.event_type,
        severity=payload.severity.upper(),
        message=payload.message,
        raw_payload=payload.raw_payload,
        tenant_id=x_tenant_id
    )
    db.add(log_entry)
    db.commit()
    return {"status": "ingested"}

@router.get("/logs")
def get_logs(
    limit: int = 100, 
    severity: Optional[str] = None, 
    x_tenant_id: str = Header(...), 
    db: Session = Depends(get_db)
):
    """Fetch SIEM logs for the SOC Dashboard."""
    query = db.query(SiemLog).filter(SiemLog.tenant_id == x_tenant_id)
    
    if severity:
        query = query.filter(SiemLog.severity == severity.upper())
        
    logs = query.order_by(SiemLog.timestamp.desc()).limit(limit).all()
    return {"tenant_id": x_tenant_id, "logs": logs}
