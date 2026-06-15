from fastapi import APIRouter, Header, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.mysql import get_db
from app.models.asset import Asset
from app.services.domain_service import scan_domain
from app.services.web_service import analyze_web_security
from app.services.server_service import analyze_server_exposure
from app.services.container_service import scan_container_image
from app.services.cloud_service import analyze_cloud_posture
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/assets", tags=["Assets"])

@router.get("")
def list_assets(x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """List assets for the tenant from the database."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    assets = db.query(Asset).filter(Asset.tenant_id == x_tenant_id).all()
    
    # We map the database model back to the format the frontend expects
    asset_list = []
    for a in assets:
        asset_list.append({
            "id": a.id,
            "asset_type": a.asset_type,
            "identifier": a.identifier,
            "environment": a.environment,
            "criticality": a.criticality,
            "owner": a.owner,
            "status": "Monitored" # Mapped since we removed it from model
        })

    return {
        "tenant_id": x_tenant_id,
        "assets": asset_list
    }

@router.post("/{asset_id}/scan-domain")
def trigger_domain_scan(asset_id: str, x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Run an active Domain Security scan against a registered Domain asset."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.tenant_id == x_tenant_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    if asset.asset_type.lower() != "domain":
        raise HTTPException(status_code=400, detail="Can only scan assets of type 'Domain'")
        
    # Perform the scan
    results = scan_domain(asset.identifier)
    
    # Audit log
    log_action(db, tenant_id=x_tenant_id, user="admin@acme.corp", action="DOMAIN_SCAN", resource=asset.identifier, details=f"Status: {results['status']}")
    
    return results

@router.post("/{asset_id}/scan-web")
def trigger_web_scan(asset_id: str, x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Run an active Web Application Security scan."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.tenant_id == x_tenant_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    valid_types = ["server", "web app", "api", "domain"]
    if asset.asset_type.lower() not in valid_types:
        raise HTTPException(status_code=400, detail="Asset type not supported for web scan")
        
    # Perform the scan
    results = analyze_web_security(asset.identifier)
    
    # Audit log
    log_action(db, tenant_id=x_tenant_id, user="admin@acme.corp", action="WEB_SCAN", resource=asset.identifier, details=f"Status: {results['status']}")
    
    return results

@router.post("/{asset_id}/scan-server")
def trigger_server_scan(asset_id: str, x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Run an active Server Security Open Port scan."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.tenant_id == x_tenant_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    valid_types = ["server", "endpoint"]
    if asset.asset_type.lower() not in valid_types:
        raise HTTPException(status_code=400, detail="Asset type not supported for server scan")
        
    # Perform the scan
    results = analyze_server_exposure(asset.identifier)
    
    # Audit log
    log_action(db, tenant_id=x_tenant_id, user="admin@acme.corp", action="SERVER_SCAN", resource=asset.identifier, details=f"Status: {results['status']}")
    
    return results

@router.post("/{asset_id}/scan-container")
def trigger_container_scan(asset_id: str, x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Run an active Container Static Analysis scan."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.tenant_id == x_tenant_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    valid_types = ["container"]
    if asset.asset_type.lower() not in valid_types:
        raise HTTPException(status_code=400, detail="Asset type not supported for container scan")
        
    # Perform the scan
    results = scan_container_image(asset.identifier)
    
    # Audit log
    log_action(db, tenant_id=x_tenant_id, user="admin@acme.corp", action="CONTAINER_SCAN", resource=asset.identifier, details=f"Status: {results['status']}")
    
    return results

@router.post("/{asset_id}/scan-cloud")
def trigger_cloud_scan(asset_id: str, x_tenant_id: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Run an active Cloud Security Posture Management scan."""
    if not x_tenant_id:
        raise HTTPException(status_code=400, detail="X-Tenant-ID header is required")
        
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.tenant_id == x_tenant_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    valid_types = ["cloud account"]
    if asset.asset_type.lower() not in valid_types:
        raise HTTPException(status_code=400, detail="Asset type not supported for cloud scan")
        
    # Perform the scan
    results = analyze_cloud_posture(asset.identifier)
    
    # Audit log
    log_action(db, tenant_id=x_tenant_id, user="admin@acme.corp", action="CLOUD_SCAN", resource=asset.identifier, details=f"Status: {results['status']}")
    
    return results
