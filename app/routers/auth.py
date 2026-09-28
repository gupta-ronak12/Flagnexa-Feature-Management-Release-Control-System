from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Request models
class SignupRequest(BaseModel):
    full_name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# SIGNUP
@router.post("/signup")
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User created successfully",
        "user_id": user.id,
        "email": user.email
    }


# LOGIN
@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer"
    }


# HOME
@router.get("/home")
def home(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        user = get_current_user(credentials.credentials)

        return {
            "message": f"Welcome {user.full_name}",
            "user_id": user.id,
            "email": user.email
        }

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )