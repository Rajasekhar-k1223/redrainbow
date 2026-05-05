from sqlalchemy.orm import Session
from app.db.mysql import SessionLocal
from app.services.user_service import create_user, get_user_by_username
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_admin():
    db = SessionLocal()
    try:
        username = "admin"
        password = "admin"
        if get_user_by_username(db, username):
            print(f"User {username} already exists.")
            return
        
        password_hash = pwd_context.hash(password)
        create_user(db, username, password_hash)
        print(f"User {username} created successfully with password {password}")
    finally:
        db.close()

if __name__ == "__main__":
    init_admin()
