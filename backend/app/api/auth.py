from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.api.schemas import UserCreate, UserOut
from app.core.security import create_access_token
from app.db.mysql import get_db
from app.services.user_service import create_user, get_user_by_username

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # SECURITY: Validate invitation code against system configuration
    from app.core.config import settings
    required_code = getattr(settings, "registration_invite_code", "RR-MASTER-2025")
    if user.invite_code != required_code:
        raise HTTPException(status_code=403, detail="Invalid or missing invitation code")

    if get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    password_hash = pwd_context.hash(user.password)
    created = create_user(db, user.username, password_hash)
    return created


@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(user.username)
    return {"access_token": token, "token_type": "bearer"}
