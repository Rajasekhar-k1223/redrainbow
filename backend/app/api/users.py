from fastapi import APIRouter, Depends

from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def read_me(user=Depends(get_current_user)):
    return {"username": user.username}
