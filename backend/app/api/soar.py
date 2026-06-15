from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Optional
from sqlalchemy.orm import Session
from app.db.mysql import get_db
from app.services.soar_service import execute_playbook_action
from app.services.audit_service import log_action
from app.core.security import get_current_admin_user, TokenData
import asyncio

router = APIRouter(prefix="/api/v1/soar", tags=["SOAR"])

PLAYBOOKS = [
    {"id": "pb-001", "name": "Isolate Endpoint", "description": "Uses Monitorix to drop all network connections except to RedRainbow core.", "risk_level": "High", "requires_approval": True},
    {"id": "pb-002", "name": "Block Malicious IP", "description": "Adds IP to the global firewall blocklist via UniCloudOps.", "risk_level": "Medium", "requires_approval": False},
    {"id": "pb-003", "name": "Revoke IAM Token", "description": "Revokes AWS/Azure session tokens for a compromised user.", "risk_level": "High", "requires_approval": True},
    {"id": "pb-004", "name": "Trigger Deep Scan", "description": "Launches a comprehensive OWASP ZAP and Nmap scan against the target.", "risk_level": "Low", "requires_approval": False},
]

@router.get("/playbooks")
def list_playbooks(x_tenant_id: Optional[str] = Header(None)):
    """List available SOAR playbooks."""
    return {"tenant_id": x_tenant_id, "playbooks": PLAYBOOKS}

@router.post("/execute/{playbook_id}")
async def execute_playbook(
    playbook_id: str, 
    x_tenant_id: Optional[str] = Header(None), 
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_admin_user)
):
    """Simulate execution of a playbook with real HTTP outbound action."""
    playbook = next((pb for pb in PLAYBOOKS if pb["id"] == playbook_id), None)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
        
    try:
        # Pass off to the service engine for real execution
        result_msg = execute_playbook_action(playbook_id, db)
        
        # Log the action
        if x_tenant_id:
            log_action(db, tenant_id=x_tenant_id, user=current_user.username, action="PLAYBOOK_EXECUTE", resource=playbook['name'], details=result_msg)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "status": "success",
        "message": f"Playbook '{playbook['name']}' executed successfully. Firewall says: {result_msg}",
        "execution_id": f"exec-{playbook_id}-99"
    }
