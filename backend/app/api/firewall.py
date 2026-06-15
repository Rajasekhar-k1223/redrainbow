from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

router = APIRouter(prefix="/api/v1/firewall", tags=["Firewall"])
logger = logging.getLogger(__name__)

class BlockRequest(BaseModel):
    ip_address: str
    reason: str

@router.post("/block_ip")
def block_ip(req: BlockRequest):
    """
    Mock endpoint simulating an enterprise firewall (like Palo Alto).
    """
    if not req.ip_address:
        raise HTTPException(status_code=400, detail="IP address required")
        
    logger.info(f"FIREWALL MOCK: Blocking IP {req.ip_address}. Reason: {req.reason}")
    
    return {
        "status": "success",
        "action": "ip_blocked",
        "ip": req.ip_address,
        "message": f"Successfully added {req.ip_address} to the global blocklist."
    }
