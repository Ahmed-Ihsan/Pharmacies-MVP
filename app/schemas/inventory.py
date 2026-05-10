from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.core.constants import InventoryStatus, MovementType, AlertType


class InventoryBase(BaseModel):
    brand_id: int
    current_quantity: int = Field(default=0, ge=0)
    minimum_quantity: int = Field(default=10, ge=0)
    maximum_quantity: int = Field(default=1000, ge=0)
    reorder_quantity: int = Field(default=50, ge=0)
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    manufacturing_date: Optional[datetime] = None
    location: Optional[str] = None
    status: InventoryStatus = InventoryStatus.AVAILABLE


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    current_quantity: Optional[int] = Field(default=None, ge=0)
    minimum_quantity: Optional[int] = Field(default=None, ge=0)
    maximum_quantity: Optional[int] = Field(default=None, ge=0)
    reorder_quantity: Optional[int] = Field(default=None, ge=0)
    batch_number: Optional[str] = None
    expiry_date: Optional[datetime] = None
    manufacturing_date: Optional[datetime] = None
    location: Optional[str] = None
    status: Optional[InventoryStatus] = None


class Inventory(InventoryBase):
    inventory_id: int
    last_restocked_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class InventoryWithDetails(Inventory):
    brand_name: str
    generic_name: str
    manufacturer_name: Optional[str] = None
    dosage_form: Optional[str] = None


class InventoryMovementBase(BaseModel):
    inventory_id: int
    movement_type: MovementType
    quantity: int = Field(..., gt=0)
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    reason: Optional[str] = None
    notes: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    pass


class InventoryMovement(InventoryMovementBase):
    movement_id: int
    previous_quantity: int
    new_quantity: int
    performed_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class InventoryAlertBase(BaseModel):
    inventory_id: int
    alert_type: AlertType
    threshold_value: Optional[int] = None
    current_value: Optional[int] = None
    severity: str = "MEDIUM"
    message: Optional[str] = None


class InventoryAlertCreate(InventoryAlertBase):
    pass


class InventoryAlert(InventoryAlertBase):
    alert_id: int
    is_resolved: bool = False
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class InventoryStats(BaseModel):
    total_items: int
    low_stock_items: int
    out_of_stock_items: int
    expiring_soon_items: int
    expired_items: int
    total_value: Optional[float] = None
