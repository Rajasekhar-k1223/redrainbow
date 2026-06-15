from fastapi import APIRouter, Depends, Header, HTTPException
from app.services.intel_service import fetch_otx_pulses

router = APIRouter(prefix="/api/v1/intel", tags=["Threat Intel"])

@router.get("/pulses")
def get_threat_pulses(x_tenant_id: str = Header(...)):
    """Fetches real-time threat intelligence pulses (IoCs)."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID is required")
        
    pulses = fetch_otx_pulses()
    return pulses
