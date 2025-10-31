from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials  # ✅ Added
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models import Lecturers, Students
import os

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# ✅ Replaces OAuth2PasswordBearer — enables Bearer Token authentication
security = HTTPBearer()


class LoginRequest(BaseModel):
    email: str
    password: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", tags=["Authentication"])
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Try lecturer first
    user = db.query(Lecturers).filter(Lecturers.email == request.email).first()

    # If not found, try student
    if not user:
        user = db.query(Students).filter(Students.email == request.email).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")

    role = "lecturer" if hasattr(user, "lecturer_id") else "student"

    access_token = create_access_token(data={"sub": request.email, "role": role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": role,
        "email": request.email
    }


# ✅ Decode & verify Bearer Token
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"email": email, "role": role}

    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")
