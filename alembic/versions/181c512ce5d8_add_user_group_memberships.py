"""add user group memberships

Revision ID: 181c512ce5d8
Revises: d5ae171cda67
Create Date: 2026-09-15 16:34:32.549264

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "181c512ce5d8"
down_revision: Union[str, Sequence[str], None] = "d5ae171cda67"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create user group memberships table."""

    op.create_table(
        "user_group_memberships",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("group_id", sa.Integer(), nullable=False),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),

        sa.ForeignKeyConstraint(
            ["group_id"],
            ["user_groups.id"],
        ),

        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "group_id",
            name="unique_user_group",
        ),
    )

    op.create_index(
        "ix_user_group_memberships_id",
        "user_group_memberships",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop user group memberships table."""

    op.drop_index(
        "ix_user_group_memberships_id",
        table_name="user_group_memberships",
    )

    op.drop_table("user_group_memberships")