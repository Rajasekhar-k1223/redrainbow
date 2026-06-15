from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.db.mysql import get_db
from app.models.monitorix import MonitorixAgent
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/monitorix", tags=["Monitorix"])

class AgentRegister(BaseModel):
    hostname: str
    os_version: str
    ip_address: str

class AgentHeartbeat(BaseModel):
    agent_id: str

@router.post("/register")
def register_agent(payload: AgentRegister, x_tenant_id: str = Header(...), db: Session = Depends(get_db)):
    """Registers a new C++ Monitorix agent."""
    agent = MonitorixAgent(
        hostname=payload.hostname,
        os_version=payload.os_version,
        ip_address=payload.ip_address,
        status="Online",
        tenant_id=x_tenant_id
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {"status": "registered", "agent_id": agent.id}

@router.post("/heartbeat")
def agent_heartbeat(payload: AgentHeartbeat, x_tenant_id: str = Header(...), db: Session = Depends(get_db)):
    """High-throughput heartbeat endpoint for active agents."""
    agent = db.query(MonitorixAgent).filter(
        MonitorixAgent.id == payload.agent_id, 
        MonitorixAgent.tenant_id == x_tenant_id
    ).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    agent.last_heartbeat = datetime.utcnow()
    agent.status = "Online"
    db.commit()
    return {"status": "ack"}

@router.get("/fleet")
def get_fleet_status(x_tenant_id: str = Header(...), db: Session = Depends(get_db)):
    """Returns the real-time status of all deployed agents for the React UI."""
    agents = db.query(MonitorixAgent).filter(MonitorixAgent.tenant_id == x_tenant_id).all()
    
    # Calculate if an agent missed a heartbeat (e.g. offline > 2 mins)
    now = datetime.utcnow()
    for agent in agents:
        diff = (now - agent.last_heartbeat).total_seconds()
        if diff > 120 and agent.status == "Online":
            agent.status = "Offline"
            db.commit()
            
    return {"tenant_id": x_tenant_id, "agents": agents}
