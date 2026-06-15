from fastapi import APIRouter, Header, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
from app.db.mysql import get_db
from app.models.incident import Incident
from app.models.tenant import Tenant
import uuid
import datetime

router = APIRouter(prefix="/api/v1/ingest", tags=["Ingestion"])

# In a real app, this mapping would live in the DB.
# For demo purposes, we map a mock API key to our seeded tenant ID.
API_KEY_TENANT_MAP = {
    "sk_redrainbow_mock_9999": "tenant-1234-5678"
}

def normalize_severity(raw_severity):
    """Normalize various external severity scores/strings to RedRainbow standard."""
    if isinstance(raw_severity, str):
        val = raw_severity.lower()
        if val in ["critical", "fatal", "10", "9"]: return "Critical"
        if val in ["high", "8", "7"]: return "High"
        if val in ["medium", "warn", "warning", "6", "5", "4"]: return "Medium"
        return "Low"
    elif isinstance(raw_severity, (int, float)):
        if raw_severity >= 9: return "Critical"
        if raw_severity >= 7: return "High"
        if raw_severity >= 4: return "Medium"
        return "Low"
    return "Medium"

@router.post("/webhook")
async def ingest_webhook(
    request: Request,
    x_api_key: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Ingests raw JSON from external tools (Splunk, CrowdStrike, AWS, etc)
    and normalizes it into a RedRainbow Incident.
    """
    if not x_api_key:
        raise HTTPException(status_code=401, detail="X-API-Key header is required for ingestion")
    
    tenant_id = API_KEY_TENANT_MAP.get(x_api_key)
    if not tenant_id:
        raise HTTPException(status_code=403, detail="Invalid API Key")
        
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # ---------------------------------------------------------
    # NORMALIZATION LOGIC
    # Heuristically extract title, severity, and summary based on common keys
    # ---------------------------------------------------------
    title = (
        payload.get("alert_name") or 
        payload.get("title") or 
        payload.get("description") or 
        payload.get("name") or 
        "External Security Alert"
    )
    
    raw_severity = (
        payload.get("severity") or 
        payload.get("level") or 
        payload.get("risk_score") or 
        "medium"
    )
    
    normalized_severity = normalize_severity(raw_severity)
    
    summary = str(payload) # In a real app, format this nicely.
    
    new_incident = Incident(
        id=f"inc-{uuid.uuid4().hex[:8]}",
        title=f"[Ingested] {title}",
        severity=normalized_severity,
        status="Open",
        tenant_id=tenant_id,
        summary=f"Raw Payload: {summary}"
    )
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    return {"status": "success", "message": "Alert ingested and normalized", "incident_id": new_incident.id}
