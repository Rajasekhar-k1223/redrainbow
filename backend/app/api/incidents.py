from fastapi import APIRouter, Header, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from app.db.mysql import get_db
from app.models.incident import Incident
from app.models.asset import Asset
from app.services.ai_service import generate_remediation_plan
from app.schemas import IncidentCreate, IncidentResponse
from app.services.webhook_service import dispatch_webhook

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])

@router.post("/", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    x_tenant_id: str = Header(...)
):
    new_incident = Incident(
        tenant_id=x_tenant_id,
        title=incident.title,
        severity=incident.severity,
        asset_id=incident.asset_id,
        status="Open"
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    # Layer 12: Real API Webhooks. Dispatch if Critical or High.
    if new_incident.severity.upper() in ["CRITICAL", "HIGH"]:
        incident_data = {
            "id": new_incident.id,
            "title": new_incident.title,
            "severity": new_incident.severity,
            "asset_id": new_incident.asset_id,
            "status": new_incident.status
        }
        background_tasks.add_task(dispatch_webhook, incident_data)

    return new_incident

@router.get("")
def list_incidents(x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """List active incidents for the tenant from the database."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    incidents = db.query(Incident).filter(Incident.tenant_id == x_tenant_id).all()
    
    incident_list = []
    for i in incidents:
        # Assuming created_at is available via TimestampMixin, format it simply for the UI
        # We will use a mock "10m ago" format for now if datetime formatting isn't trivial,
        # but let's just pass the title and summary mapped correctly.
        incident_list.append({
            "id": i.id,
            "title": i.title,
            "severity": i.severity,
            "status": i.status,
            "time": "Just now", # Mapped since we removed explicit time string
            "summary": i.summary
        })

    return {
        "tenant_id": x_tenant_id,
        "incidents": incident_list
    }

@router.post("/{incident_id}/remediation")
def get_ai_remediation(incident_id: str, x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Uses Gemini AI to generate a structured remediation plan for an incident."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
    
    incident = db.query(Incident).filter(
        Incident.id == incident_id,
        Incident.tenant_id == x_tenant_id
    ).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    plan = generate_remediation_plan(
        incident_title=incident.title,
        incident_summary=incident.summary or "No details available."
    )
    
    return {
        "incident_id": incident_id,
        "incident_title": incident.title,
        "remediation_plan": plan
    }
