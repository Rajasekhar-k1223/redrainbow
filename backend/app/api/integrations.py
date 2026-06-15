from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
import logging

logger = logging.getLogger("integrations")
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/api/v1/integrations", tags=["External Integrations"])

class SentinelPayload(BaseModel):
    findings: list
    incident_id: str

@router.post("/sentinelx/inbound")
def sentinelx_inbound_webhook(payload: dict, x_tenant_id: str = Header(...)):
    """Receives AI Executive Summaries and Risk Scores from SentinelX."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID required")
    logger.info(f"[SentinelX] Received AI Context for Tenant {x_tenant_id}")
    return {"status": "ingested", "source": "SentinelX"}

@router.post("/unicloudops/inventory")
def unicloudops_inventory_sync(payload: dict, x_tenant_id: str = Header(...)):
    """Receives dynamic Cloud Infrastructure Metadata from UniCloudOps."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID required")
    logger.info(f"[UniCloudOps] Synced {len(payload.get('assets', []))} assets for Tenant {x_tenant_id}")
    return {"status": "synced", "source": "UniCloudOps"}
