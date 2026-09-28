from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.environment import Environment
from app.models.environment_override import EnvironmentOverride
from app.schemas.environment import (
    EnvironmentCreate,
    EnvironmentUpdate,
    EnvironmentResponse
)
from app.core.security import get_current_user


router = APIRouter(
    prefix="/environments",
    tags=["Environments"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CREATE ENVIRONMENT
@router.post("/", response_model=EnvironmentResponse)
def create_environment(
    environment: EnvironmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing = db.query(Environment).filter(
        Environment.name == environment.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Environment already exists"
        )

    new_environment = Environment(
        name=environment.name,
        description=environment.description
    )

    db.add(new_environment)
    db.commit()
    db.refresh(new_environment)

    return new_environment


# GET ALL ENVIRONMENTS
@router.get("/", response_model=list[EnvironmentResponse])
def get_environments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Environment).all()


# GET SINGLE ENVIRONMENT
@router.get("/{environment_id}", response_model=EnvironmentResponse)
def get_environment(
    environment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    environment = db.query(Environment).filter(
        Environment.id == environment_id
    ).first()

    if not environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    return environment


# UPDATE ENVIRONMENT
@router.put("/{environment_id}", response_model=EnvironmentResponse)
def update_environment(
    environment_id: int,
    environment_data: EnvironmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    environment = db.query(Environment).filter(
        Environment.id == environment_id
    ).first()

    if not environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    update_data = environment_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(environment, key, value)

    db.commit()
    db.refresh(environment)

    return environment


# DELETE ENVIRONMENT
@router.delete("/{environment_id}")
def delete_environment(
    environment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    environment = db.query(Environment).filter(
        Environment.id == environment_id
    ).first()

    if not environment:
        raise HTTPException(
            status_code=404,
            detail="Environment not found"
        )

    # Delete related environment overrides first
    db.query(EnvironmentOverride).filter(
        EnvironmentOverride.environment_id == environment_id
    ).delete(synchronize_session=False)

    # Delete the environment
    db.delete(environment)
    db.commit()

    return {
        "message": "Environment deleted successfully"
    }