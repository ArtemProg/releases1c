"""column active table Conficuration

Revision ID: 38215f763828
Revises: 1acf015bc55c
Create Date: 2019-07-06 11:18:31.450448

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '38215f763828'
down_revision = '1acf015bc55c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('configuration', sa.Column('active', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('configuration', 'active')
    # ### end Alembic commands ###
