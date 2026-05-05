import shutil
import os
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.api.schemas import EvidenceCreate, EvidenceOut
from app.db.mysql import get_db
from app.core.security import get_current_user
from app.models.evidence import Evidence
from app.services.user_service import get_user_by_username
from typing import List, Optional
import json

router = APIRouter(prefix="/evidence", tags=["evidence"])

@router.post("/", response_model=EvidenceOut)
def create_evidence(
    evidence: EvidenceCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    user = get_user_by_username(db, current_user.username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    db_evidence = Evidence(**evidence.model_dump(), user_id=user.id)
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence

@router.get("/", response_model=List[EvidenceOut])
def get_evidences(
    severity: Optional[str] = None,
    evidence_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    user = get_user_by_username(db, current_user.username)
    if not user:
        return []
        
    query = db.query(Evidence).filter(Evidence.user_id == user.id, Evidence.is_deleted == False)
    
    if severity:
        query = query.filter(Evidence.severity == severity)
    if evidence_type:
        query = query.filter(Evidence.evidence_type == evidence_type)
    if search:
        query = query.filter(
            (Evidence.title.ilike(f"%{search}%")) | 
            (Evidence.description.ilike(f"%{search}%"))
        )
        
    return query.order_by(Evidence.created_at.desc()).all()

@router.get("/deleted", response_model=List[EvidenceOut])
def get_deleted_evidences(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    user = get_user_by_username(db, current_user.username)
    if not user:
        return []
    # Return only items in the 'trash'
    return db.query(Evidence).filter(Evidence.user_id == user.id, Evidence.is_deleted == True).all()

@router.delete("/{evidence_id}")
def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = get_user_by_username(db, current_user.username)
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.user_id == user.id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    evidence.is_deleted = True
    db.commit()
    return {"status": "moved to trash"}

@router.post("/{evidence_id}/recover")
def recover_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = get_user_by_username(db, current_user.username)
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.user_id == user.id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found in trash")
    
    evidence.is_deleted = False
    db.commit()
    return {"status": "recovered"}

# --- SIEM & INTELLIGENCE SERVICES ---

@router.get("/{evidence_id}/stix", tags=["intelligence"])
def export_stix_indicator(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Exports forensic evidence as a STIX 2.1 Threat Indicator for SIEM insertion."""
    user = get_user_by_username(db, current_user.username)
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.user_id == user.id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    # Constructing a STIX 2.1 Indicator (Manual object representation to avoid extra dependencies)
    stix_indicator = {
        "type": "indicator",
        "spec_version": "2.1",
        "id": f"indicator--{evidence.id}-{int(evidence.created_at.timestamp())}",
        "created": evidence.created_at.isoformat() + "Z",
        "modified": evidence.created_at.isoformat() + "Z",
        "name": f"RedRainbow Forensic Signal: {evidence.title}",
        "description": evidence.description or "Automated forensic capture",
        "indicator_types": ["malicious-activity"],
        "pattern": f"[file:hashes.'SHA-256' = '{evidence.sha256}']" if evidence.sha256 else f"[file:name = '{evidence.title}']",
        "pattern_type": "stix",
        "pattern_version": "2.1",
        "valid_from": evidence.created_at.isoformat() + "Z",
        "external_references": [
            {"source_name": "RedRainbow-Orchestrator", "external_id": f"MISSION-{evidence.id}"}
        ]
    }
    
    return stix_indicator

@router.get("/correlate/{sha256}", tags=["intelligence"])
def correlate_indicators(
    sha256: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Identifies recurring threat patterns across all historical missions for the user."""
    user = get_user_by_username(db, current_user.username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    correlations = db.query(Evidence).filter(
        Evidence.sha256 == sha256,
        Evidence.is_deleted == False
    ).order_by(Evidence.created_at.desc()).all()
    
    if not correlations:
        return {"status": "unique", "matches": 0, "history": []}
        
    return {
        "status": "recurring_threat",
        "matches": len(correlations),
        "history": [
            {"id": c.id, "title": c.title, "severity": c.severity, "timestamp": c.created_at} 
            for c in correlations
        ]
    }


@router.post("/{evidence_id}/upload")
async def upload_evidence_file(
    evidence_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = get_user_by_username(db, current_user.username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.user_id == user.id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    upload_dir = os.path.abspath("uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Secure filename: strip directory components and use a unique prefix
    safe_filename = os.path.basename(file.filename)
    file_path = os.path.join(upload_dir, f"{evidence_id}_{int(time.time())}_{safe_filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    evidence.file_path = file_path
    db.commit()
    return {"filename": safe_filename, "file_path": file_path}

from fastapi.responses import FileResponse
import time

@router.get("/{evidence_id}/download")
def download_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = get_user_by_username(db, current_user.username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.user_id == user.id).first()
    if not evidence or not evidence.file_path:
        raise HTTPException(status_code=404, detail="Evidence file not found")
    
    # SECURITY: Ensure the file path is within the designated uploads directory
    base_dir = os.path.abspath("uploads")
    target_path = os.path.abspath(evidence.file_path)
    
    if not target_path.startswith(base_dir):
        raise HTTPException(status_code=403, detail="Access denied: Invalid file path")

    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="Physical file not found on server")
        
    return FileResponse(
        path=target_path,
        filename=os.path.basename(target_path),
        media_type='application/octet-stream'
    )
