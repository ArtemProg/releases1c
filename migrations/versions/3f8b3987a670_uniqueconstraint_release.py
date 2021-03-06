"""UniqueConstraint Release

Revision ID: 3f8b3987a670
Revises: accfc6a50754
Create Date: 2019-06-11 23:40:41.016337

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3f8b3987a670'
down_revision = 'accfc6a50754'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_release_version', table_name='release')
    op.create_index(op.f('ix_release_version'), 'release', ['version'], unique=False)
    op.create_unique_constraint(None, 'release', ['configuration_id', 'version'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'release', type_='unique')
    op.drop_index(op.f('ix_release_version'), table_name='release')
    op.create_index('ix_release_version', 'release', ['version'], unique=True)
    # ### end Alembic commands ###
