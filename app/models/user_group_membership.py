from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.database.database import Base


class UserGroupMembership(Base):
    __tablename__ = "user_group_memberships"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    group_id = Column(
        Integer,
        ForeignKey("user_groups.id"),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "group_id",
            name="unique_user_group"
        ),
    )