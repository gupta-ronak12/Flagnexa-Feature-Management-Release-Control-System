"""create user group memberships table

Revision ID: 8fbf494499fe
Revises: 6f8cd7590b6e
Create Date: 2026-09-15 19:18:44.292493

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8fbf494499fe'
down_revision: Union[str, Sequence[str], None] = '6f8cd7590b6e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add unique constraint to user group memberships."""

    op.create_unique_constraint(
        "unique_user_group",
        "user_group_memberships",
        ["user_id", "group_id"],
    )


def downgrade() -> None:
    """Remove unique constraint."""

    op.drop_constraint(
        "unique_user_group",
        "user_group_memberships",
        type_="unique",
    )
