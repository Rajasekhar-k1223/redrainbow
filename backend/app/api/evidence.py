import shutil
import os
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.api.schemas import EvidenceCreate, EvidenceOut
from app.db.mysql import get_db
from app.core.security import get_current_user
from app.models.evidence import Evidence
from typing import List

router = APIRouter(prefix="/evidence", tags=["evidence"])

@router.post("/", response_model=EvidenceOut)
def create_evidence(
    evidence: EvidenceCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    db_evidence = Evidence(**evidence.model_dump(), user_id=current_user.id)
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence

@router.get("/", response_model=List[EvidenceOut])
def get_evidences(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    return db.query(Evidence).filter(Evidence.user_id == current_user.id).all()


@router.post("/{evidence_id}/upload")
async def upload_evidence_file(
    evidence_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id, Evidence.user_id == current_user.id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{evidence_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    evidence.file_path = file_path
    db.commit()
    return {"filename": file.filename, "file_path": file_path}
