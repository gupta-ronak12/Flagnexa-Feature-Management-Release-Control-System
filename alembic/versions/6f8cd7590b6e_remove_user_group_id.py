"""remove user group id

Revision ID: 6f8cd7590b6e
Revises: 181c512ce5d8
Create Date: 2026-09-15 18:03:48.191606

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f8cd7590b6e'
down_revision: Union[str, Sequence[str], None] = '181c512ce5d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Copy existing group memberships into the new
    # many-to-many membership table.
    op.execute(
        """
        INSERT INTO user_group_memberships (user_id, group_id)
        SELECT id, group_id
        FROM users
        WHERE group_id IS NOT NULL
        """
    )

    # Remove the old single-group relationship.
    op.drop_constraint(
        op.f('users_group_id_fkey'),
        'users',
        type_='foreignkey'
    )

    op.drop_column(
        'users',
        'group_id'
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Add the old group_id column back.
    op.add_column(
        'users',
        sa.Column(
            'group_id',
            sa.INTEGER(),
            autoincrement=False,
            nullable=True
        )
    )

    op.create_foreign_key(
        op.f('users_group_id_fkey'),
        'users',
        'user_groups',
        ['group_id'],
        ['id']
    )

    # Restore one group for each user.
    # The old design allowed only one group per user.
    op.execute(
        """
        UPDATE users u
        SET group_id = m.group_id
        FROM (
            SELECT DISTINCT ON (user_id)
                   user_id,
                   group_id
            FROM user_group_memberships
            ORDER BY user_id, id
        ) m
        WHERE u.id = m.user_id
        """
    )
