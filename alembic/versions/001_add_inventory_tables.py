"""Add inventory management tables

Revision ID: 001_add_inventory
Revises: 
Create Date: 2026-05-10

"""
from alembic import op
import sqlalchemy as sa

revision = '001_add_inventory'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'inventory',
        sa.Column('inventory_id', sa.Integer(), nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=False),
        sa.Column('current_quantity', sa.Integer(), nullable=True),
        sa.Column('minimum_quantity', sa.Integer(), nullable=True),
        sa.Column('maximum_quantity', sa.Integer(), nullable=True),
        sa.Column('reorder_quantity', sa.Integer(), nullable=True),
        sa.Column('batch_number', sa.String(length=50), nullable=True),
        sa.Column('expiry_date', sa.DateTime(), nullable=True),
        sa.Column('manufacturing_date', sa.DateTime(), nullable=True),
        sa.Column('location', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('last_restocked_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['brand_id'], ['brand_names.brand_id'], ),
        sa.PrimaryKeyConstraint('inventory_id'),
        sa.UniqueConstraint('brand_id')
    )
    op.create_index('ix_inventory_brand_id', 'inventory', ['brand_id'])
    op.create_index('ix_inventory_inventory_id', 'inventory', ['inventory_id'])
    
    op.create_table(
        'inventory_movements',
        sa.Column('movement_id', sa.Integer(), nullable=False),
        sa.Column('inventory_id', sa.Integer(), nullable=False),
        sa.Column('movement_type', sa.String(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('previous_quantity', sa.Integer(), nullable=True),
        sa.Column('new_quantity', sa.Integer(), nullable=True),
        sa.Column('reference_type', sa.String(length=50), nullable=True),
        sa.Column('reference_id', sa.Integer(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('performed_by', sa.String(length=100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['inventory_id'], ['inventory.inventory_id'], ),
        sa.PrimaryKeyConstraint('movement_id')
    )
    op.create_index('ix_inventory_movements_inventory_id', 'inventory_movements', ['inventory_id'])
    op.create_index('ix_inventory_movements_movement_id', 'inventory_movements', ['movement_id'])
    
    op.create_table(
        'inventory_alerts',
        sa.Column('alert_id', sa.Integer(), nullable=False),
        sa.Column('inventory_id', sa.Integer(), nullable=False),
        sa.Column('alert_type', sa.String(), nullable=False),
        sa.Column('threshold_value', sa.Integer(), nullable=True),
        sa.Column('current_value', sa.Integer(), nullable=True),
        sa.Column('severity', sa.String(length=20), nullable=True),
        sa.Column('is_resolved', sa.Boolean(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_by', sa.String(length=100), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['inventory_id'], ['inventory.inventory_id'], ),
        sa.PrimaryKeyConstraint('alert_id')
    )
    op.create_index('ix_inventory_alerts_inventory_id', 'inventory_alerts', ['inventory_id'])
    op.create_index('ix_inventory_alerts_alert_id', 'inventory_alerts', ['alert_id'])


def downgrade():
    op.drop_index('ix_inventory_alerts_alert_id', table_name='inventory_alerts')
    op.drop_index('ix_inventory_alerts_inventory_id', table_name='inventory_alerts')
    op.drop_table('inventory_alerts')
    
    op.drop_index('ix_inventory_movements_movement_id', table_name='inventory_movements')
    op.drop_index('ix_inventory_movements_inventory_id', table_name='inventory_movements')
    op.drop_table('inventory_movements')
    
    op.drop_index('ix_inventory_inventory_id', table_name='inventory')
    op.drop_index('ix_inventory_brand_id', table_name='inventory')
    op.drop_table('inventory')
