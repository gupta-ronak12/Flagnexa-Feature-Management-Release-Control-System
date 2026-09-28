from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user_group import UserGroup
from app.models.user import User
from app.models.user_group_membership import UserGroupMembership
from app.schemas.user_group import UserGroupCreate, UserGroupResponse


router = APIRouter(
    prefix="/user-groups",
    tags=["User Groups"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=UserGroupResponse)
def create_group(
    data: UserGroupCreate,
    db: Session = Depends(get_db)
):
    existing_group = (
        db.query(UserGroup)
        .filter(UserGroup.name == data.name)
        .first()
    )

    if existing_group:
        raise HTTPException(
            status_code=400,
            detail="Group already exists"
        )

    group = UserGroup(name=data.name)

    db.add(group)
    db.commit()
    db.refresh(group)

    return group


@router.get("/", response_model=list[UserGroupResponse])
def get_groups(
    db: Session = Depends(get_db)
):
    return db.query(UserGroup).all()


@router.get("/{group_id}", response_model=UserGroupResponse)
def get_group(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = (
        db.query(UserGroup)
        .filter(UserGroup.id == group_id)
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    return group


@router.get("/{group_id}/users")
def get_group_users(
    group_id: int,
    db: Session = Depends(get_db)
):
    group = (
        db.query(UserGroup)
        .filter(UserGroup.id == group_id)
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    users = (
        db.query(User)
        .join(
            UserGroupMembership,
            User.id == UserGroupMembership.user_id
        )
        .filter(
            UserGroupMembership.group_id == group_id
        )
        .all()
    )

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
        for user in users
    ]


@router.post("/{group_id}/users/{user_id}")
def add_user_to_group(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    group = (
        db.query(UserGroup)
        .filter(UserGroup.id == group_id)
        .first()
    )

    if not group:
        raise HTTPException(
            status_code=404,
            detail="Group not found"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_membership = (
        db.query(UserGroupMembership)
        .filter(
            UserGroupMembership.user_id == user_id,
            UserGroupMembership.group_id == group_id
        )
        .first()
    )

    if existing_membership:
        raise HTTPException(
            status_code=400,
            detail="User is already a member of this group"
        )

    membership = UserGroupMembership(
        user_id=user_id,
        group_id=group_id
    )

    db.add(membership)
    db.commit()
    db.refresh(membership)

    return {
        "message": "User added to group successfully",
        "user_id": user_id,
        "group_id": group_id
    }


@router.delete("/{group_id}/users/{user_id}")
def remove_user_from_group(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    membership = (
        db.query(UserGroupMembership)
        .filter(
            UserGroupMembership.user_id == user_id,
            UserGroupMembership.group_id == group_id
        )
        .first()
    )

    if not membership:
        raise HTTPException(
            status_code=404,
            detail="User is not a member of this group"
        )

    db.delete(membership)
    db.commit()

    return {
        "message": "User removed from group successfully",
        "user_id": user_id,
        "group_id": group_id
    }