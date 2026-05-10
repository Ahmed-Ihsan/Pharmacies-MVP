from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.constants import InventoryStatus, MovementType, AlertType


class Inventory(Base):
    __tablename__ = "inventory"
    
    inventory_id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brand_names.brand_id"), nullable=False, unique=True)
    current_quantity = Column(Integer, default=0)
    minimum_quantity = Column(Integer, default=10)
    maximum_quantity = Column(Integer, default=1000)
    reorder_quantity = Column(Integer, default=50)
    batch_number = Column(String(50))
    expiry_date = Column(DateTime)
    manufacturing_date = Column(DateTime)
    location = Column(String(100))
    status = Column(Enum(InventoryStatus), default=InventoryStatus.AVAILABLE)
    last_restocked_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    brand = relationship("BrandName", back_populates="inventory", uselist=False)
    movements = relationship("InventoryMovement", back_populates="inventory", cascade="all, delete-orphan")
    alerts = relationship("InventoryAlert", back_populates="inventory", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Inventory(inventory_id={self.inventory_id}, brand_id={self.brand_id}, quantity={self.current_quantity})>"


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    movement_id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"), nullable=False)
    movement_type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    previous_quantity = Column(Integer)
    new_quantity = Column(Integer)
    reference_type = Column(String(50))
    reference_id = Column(Integer)
    reason = Column(Text)
    performed_by = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    inventory = relationship("Inventory", back_populates="movements")

    def __repr__(self):
        return f"<InventoryMovement(movement_id={self.movement_id}, type={self.movement_type}, quantity={self.quantity})>"


class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"
    
    alert_id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"), nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)
    threshold_value = Column(Integer)
    current_value = Column(Integer)
    severity = Column(String(20))
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    resolved_by = Column(String(100))
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    inventory = relationship("Inventory", back_populates="alerts")

    def __repr__(self):
        return f"<InventoryAlert(alert_id={self.alert_id}, type={self.alert_type}, resolved={self.is_resolved})>"
