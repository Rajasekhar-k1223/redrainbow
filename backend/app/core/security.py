from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class TokenData:
    def __init__(self, username: str, role: str = "Viewer"):
        self.username = username
        self.role = role


def create_access_token(subject: str, role: str = "Viewer", expires_minutes: int = 60) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": subject,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expires_minutes)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def verify_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        sub = payload.get("sub")
        role = payload.get("role", "Viewer")
        if not sub:
            raise ValueError("Missing subject")
        return TokenData(username=sub, role=role)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    return verify_token(token)

def get_current_admin_user(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    if current_user.role not in ["Super Admin", "Security Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user


def try_get_username_from_token(token: str | None) -> str | None:
    if not token:
        return None
    if token.lower().startswith("bearer "):
        token = token[7:]
    try:
        data = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return data.get("sub")
    except Exception:
        return None
