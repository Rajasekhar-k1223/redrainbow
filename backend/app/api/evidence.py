import os
import hashlib
import shutil
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.db.mysql import get_db
from app.models.evidence import Evidence
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/v1/evidence", tags=["Evidence"])

EVIDENCE_DIR = os.path.join(os.getcwd(), "data", "evidence")
os.makedirs(EVIDENCE_DIR, exist_ok=True)

@router.post("/upload")
def upload_evidence(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(""),
    evidence_type: str = Form(...),
    source_vector: str = Form(""),
    x_tenant_id: str = Header(...),
    db: Session = Depends(get_db)
):
    """Securely uploads an artifact, calculates its SHA-256, and stores it immutably."""
    
    # Calculate hash and save file
    file_hash = hashlib.sha256()
    temp_path = os.path.join(EVIDENCE_DIR, f"temp_{file.filename}")
    
    file_size = 0
    with open(temp_path, "wb") as buffer:
        while chunk := file.file.read(8192):
            file_size += len(chunk)
            file_hash.update(chunk)
            buffer.write(chunk)
            
    sha256_hex = file_hash.hexdigest()
    
    # Check if duplicate hash exists for this tenant
    existing = db.query(Evidence).filter(Evidence.sha256 == sha256_hex, Evidence.tenant_id == x_tenant_id).first()
    if existing:
        os.remove(temp_path)
        raise HTTPException(status_code=409, detail=f"Evidence with this hash already exists (ID: {existing.id})")
        
    # Move to permanent location named by hash
    perm_path = os.path.join(EVIDENCE_DIR, sha256_hex)
    shutil.move(temp_path, perm_path)
    
    new_evidence = Evidence(
        title=title,
        description=description,
        file_path=perm_path,
        file_name=file.filename,
        file_size=file_size,
        sha256=sha256_hex,
        evidence_type=evidence_type,
        source_vector=source_vector,
        uploaded_by="admin@acme.corp",
        tenant_id=x_tenant_id
    )
    
    db.add(new_evidence)
    db.commit()
    db.refresh(new_evidence)
    
    log_action(db, x_tenant_id, "admin@acme.corp", "EVIDENCE_UPLOAD", new_evidence.id, f"Uploaded {file.filename} (Hash: {sha256_hex})")
    
    return new_evidence

@router.get("")
def list_evidence(x_tenant_id: str = Header(...), db: Session = Depends(get_db)):
    """Fetch the forensic chain of custody ledger."""
    evidence_list = db.query(Evidence).filter(Evidence.tenant_id == x_tenant_id).order_by(Evidence.created_at.desc()).all()
    return {"tenant_id": x_tenant_id, "evidence": evidence_list}

@router.get("/{evidence_id}/download")
def download_evidence(
    evidence_id: str, 
    x_tenant_id: Optional[str] = Header(None), 
    tenant: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Securely downloads an artifact from the vault."""
    tenant_id = x_tenant_id or tenant
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID required")
        
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.tenant_id == tenant_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
        
    if not os.path.exists(evidence.file_path):
        raise HTTPException(status_code=500, detail="Underlying artifact file is missing or tampered")
        
    log_action(db, tenant_id, "admin@acme.corp", "EVIDENCE_DOWNLOAD", evidence.id, f"Downloaded {evidence.file_name}")
    
    return FileResponse(path=evidence.file_path, filename=evidence.file_name, media_type='application/octet-stream')
