import time
from app.worker import celery_app
from app.db.mysql import SessionLocal
from app.models.incident import Incident
from app.models.asset import Asset

@celery_app.task(name="execute_nmap_scan")
def execute_nmap_scan(asset_id: str):
    """Simulates a background Nmap scan that finds a vulnerability."""
    db = SessionLocal()
    try:
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            return {"status": "error", "message": "Asset not found"}
            
        # Simulate an intensive scan
        time.sleep(3)
        
        # Generate a simulated finding/incident
        incident = Incident(
            title=f"Open Port 22/SSH Detected",
            severity="Medium",
            status="New",
            summary=f"Nmap scanner detected open SSH port on {asset.identifier}.",
            tenant_id=asset.tenant_id
        )
        db.add(incident)
        
        # Update asset status
        asset.status = "Scanned"
        
        db.commit()
        return {"status": "success", "message": f"Scan completed for {asset.identifier}", "incident_id": incident.id}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
