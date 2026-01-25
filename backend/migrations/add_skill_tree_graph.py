"""
Database migration: Add skill tree graph properties

This migration adds graph layout properties to the levels table and creates
the level_edges table for skill tree dependencies.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = 'add_skill_tree_graph'
down_revision = None  # Replace with your current head revision
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to levels table
    op.add_column('levels', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('levels', sa.Column('x_position', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('levels', sa.Column('y_position', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('levels', sa.Column('thumbnail_url', sa.String(), nullable=True))
    
    # Create level_edges table
    op.create_table('level_edges',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('world_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('from_level_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('to_level_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['world_id'], ['worlds.id'], ),
        sa.ForeignKeyConstraint(['from_level_id'], ['levels.id'], ),
        sa.ForeignKeyConstraint(['to_level_id'], ['levels.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Add index for faster lookups
    op.create_index('ix_level_edges_world_id', 'level_edges', ['world_id'])


def downgrade():
    # Drop level_edges table
    op.drop_index('ix_level_edges_world_id', table_name='level_edges')
    op.drop_table('level_edges')
    
    # Remove columns from levels table
    op.drop_column('levels', 'thumbnail_url')
    op.drop_column('levels', 'y_position')
    op.drop_column('levels', 'x_position')
    op.drop_column('levels', 'description')
