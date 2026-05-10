# Pharmacy Inventory Management System - Implementation Prompt

## Overview
Implement a comprehensive inventory management system for the pharmacy management application. The system should track stock quantities, manage inventory movements, handle expiry dates, send low stock alerts, and automatically deduct inventory when items are sold.

---

## 1. Backend Implementation

### 1.1 Database Models

Create the following models in `app/models/`:

#### Inventory Model (`app/models/inventory.py`)
```python
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.constants import InventoryStatus

class Inventory(Base):
    __tablename__ = "inventory"
    
    inventory_id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brand_names.brand_id"), nullable=False, unique=True)
    current_quantity = Column(Integer, default=0)  # Current stock on hand
    minimum_quantity = Column(Integer, default=10)  # Minimum stock threshold
    maximum_quantity = Column(Integer, default=1000)  # Maximum stock capacity
    reorder_quantity = Column(Integer, default=50)  # Quantity to reorder
    batch_number = Column(String(50))  # Batch/Lot number
    expiry_date = Column(DateTime)  # Expiration date
    manufacturing_date = Column(DateTime)  # Manufacturing date
    location = Column(String(100))  # Storage location (e.g., "Shelf A-1")
    status = Column(Enum(InventoryStatus), default=InventoryStatus.AVAILABLE)
    last_restocked_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    brand = relationship("BrandName", back_populates="inventory")
    movements = relationship("InventoryMovement", back_populates="inventory")
    alerts = relationship("InventoryAlert", back_populates="inventory")
```

#### InventoryMovement Model (`app/models/inventory.py`)
```python
class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    movement_id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"), nullable=False)
    movement_type = Column(Enum(MovementType), nullable=False)  # ADD, REMOVE, RETURN, DAMAGE, SALE
    quantity = Column(Integer, nullable=False)  # Positive for ADD, negative for REMOVE
    previous_quantity = Column(Integer)  # Quantity before movement
    new_quantity = Column(Integer)  # Quantity after movement
    reference_type = Column(String(50))  # e.g., "SALE", "PURCHASE", "RETURN", "ADJUSTMENT"
    reference_id = Column(Integer)  # ID of the related record
    reason = Column(Text)  # Reason for the movement
    performed_by = Column(String(100))  # User who performed the movement
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    inventory = relationship("Inventory", back_populates="movements")
```

#### InventoryAlert Model (`app/models/inventory.py`)
```python
class InventoryAlert(Base):
    __tablename__ = "inventory_alerts"
    
    alert_id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.inventory_id"), nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)  # LOW_STOCK, EXPIRY_SOON, EXPIRED, OVERSTOCK
    threshold_value = Column(Integer)  # The threshold that triggered the alert
    current_value = Column(Integer)  # Current value when alert was triggered
    severity = Column(String(20))  # LOW, MEDIUM, HIGH, CRITICAL
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    resolved_by = Column(String(100))
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    inventory = relationship("Inventory", back_populates="alerts")
```

### 1.2 Constants (`app/core/constants.py`)
Add the following enums:
```python
from enum import Enum

class InventoryStatus(str, Enum):
    AVAILABLE = "available"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    EXPIRED = "expired"
    EXPIRING_SOON = "expiring_soon"
    DAMAGED = "damaged"

class MovementType(str, Enum):
    ADD = "add"  # Stock addition
    REMOVE = "remove"  # Stock removal (manual)
    RETURN = "return"  # Customer return
    DAMAGE = "damage"  # Damaged stock
    SALE = "sale"  # Sold item
    ADJUSTMENT = "adjustment"  # Manual adjustment
    TRANSFER = "transfer"  # Location transfer

class AlertType(str, Enum):
    LOW_STOCK = "low_stock"
    EXPIRY_SOON = "expiry_soon"
    EXPIRED = "expired"
    OVERSTOCK = "overstock"
```

### 1.3 Pydantic Schemas (`app/schemas/inventory.py`)
```python
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
```

### 1.4 Repository (`app/repositories/inventory.py`)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.inventory import Inventory, InventoryMovement, InventoryAlert
from app.core.constants import InventoryStatus, AlertType
from app.schemas.inventory import InventoryCreate, InventoryUpdate

class InventoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get(self, inventory_id: int) -> Optional[Inventory]:
        result = await self.db.execute(
            select(Inventory).where(Inventory.inventory_id == inventory_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_brand(self, brand_id: int) -> Optional[Inventory]:
        result = await self.db.execute(
            select(Inventory).where(Inventory.brand_id == brand_id)
        )
        return result.scalar_one_or_none()
    
    async def list(self, skip: int = 0, limit: int = 100, status: Optional[InventoryStatus] = None) -> List[Inventory]:
        query = select(Inventory)
        if status:
            query = query.where(Inventory.status == status)
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def create(self, inventory: InventoryCreate) -> Inventory:
        db_inventory = Inventory(**inventory.model_dump())
        self.db.add(db_inventory)
        await self.db.commit()
        await self.db.refresh(db_inventory)
        return db_inventory
    
    async def update(self, inventory_id: int, inventory: InventoryUpdate) -> Optional[Inventory]:
        db_inventory = await self.get(inventory_id)
        if not db_inventory:
            return None
        
        update_data = inventory.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_inventory, field, value)
        
        await self.db.commit()
        await self.db.refresh(db_inventory)
        return db_inventory
    
    async def delete(self, inventory_id: int) -> bool:
        db_inventory = await self.get(inventory_id)
        if not db_inventory:
            return False
        
        await self.db.delete(db_inventory)
        await self.db.commit()
        return True
    
    async def get_low_stock(self) -> List[Inventory]:
        result = await self.db.execute(
            select(Inventory).where(
                and_(
                    Inventory.current_quantity <= Inventory.minimum_quantity,
                    Inventory.current_quantity > 0
                )
            )
        )
        return result.scalars().all()
    
    async def get_out_of_stock(self) -> List[Inventory]:
        result = await self.db.execute(
            select(Inventory).where(Inventory.current_quantity == 0)
        )
        return result.scalars().all()
    
    async def get_expiring_soon(self, days: int = 30) -> List[Inventory]:
        expiry_threshold = datetime.now() + timedelta(days=days)
        result = await self.db.execute(
            select(Inventory).where(
                and_(
                    Inventory.expiry_date <= expiry_threshold,
                    Inventory.expiry_date > datetime.now(),
                    Inventory.current_quantity > 0
                )
            )
        )
        return result.scalars().all()
    
    async def get_expired(self) -> List[Inventory]:
        result = await self.db.execute(
            select(Inventory).where(
                and_(
                    Inventory.expiry_date < datetime.now(),
                    Inventory.current_quantity > 0
                )
            )
        )
        return result.scalars().all()
    
    async def get_stats(self) -> dict:
        total = await self.db.execute(select(func.count(Inventory.inventory_id)))
        low_stock = await self.db.execute(
            select(func.count(Inventory.inventory_id)).where(
                Inventory.current_quantity <= Inventory.minimum_quantity
            )
        )
        out_of_stock = await self.db.execute(
            select(func.count(Inventory.inventory_id)).where(Inventory.current_quantity == 0)
        )
        
        return {
            "total_items": total.scalar(),
            "low_stock_items": low_stock.scalar(),
            "out_of_stock_items": out_of_stock.scalar(),
        }
```

### 1.5 Service (`app/services/inventory.py`)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import List, Optional
from app.repositories.inventory import InventoryRepository
from app.schemas.inventory import (
    InventoryCreate, InventoryUpdate, InventoryMovementCreate, 
    InventoryWithDetails
)
from app.core.constants import MovementType, AlertType, InventoryStatus

class InventoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.inventory_repo = InventoryRepository(db)
    
    async def create_inventory(self, inventory: InventoryCreate) -> InventoryWithDetails:
        db_inventory = await self.inventory_repo.create(inventory)
        await self._check_and_create_alerts(db_inventory)
        return db_inventory
    
    async def update_inventory(self, inventory_id: int, inventory: InventoryUpdate) -> Optional[InventoryWithDetails]:
        db_inventory = await self.inventory_repo.update(inventory_id, inventory)
        if db_inventory:
            await self._check_and_create_alerts(db_inventory)
        return db_inventory
    
    async def add_stock(
        self, 
        inventory_id: int, 
        quantity: int, 
        reference_type: Optional[str] = None,
        reference_id: Optional[int] = None,
        reason: Optional[str] = None,
        performed_by: Optional[str] = None
    ) -> InventoryWithDetails:
        inventory = await self.inventory_repo.get(inventory_id)
        if not inventory:
            raise ValueError("Inventory not found")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity + quantity
        
        # Create movement record
        await self._create_movement(
            inventory_id=inventory_id,
            movement_type=MovementType.ADD,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            reason=reason,
            performed_by=performed_by
        )
        
        # Update inventory
        inventory.current_quantity = new_quantity
        inventory.last_restocked_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(inventory)
        
        await self._check_and_create_alerts(inventory)
        return inventory
    
    async def remove_stock(
        self,
        inventory_id: int,
        quantity: int,
        reference_type: Optional[str] = None,
        reference_id: Optional[int] = None,
        reason: Optional[str] = None,
        performed_by: Optional[str] = None
    ) -> InventoryWithDetails:
        inventory = await self.inventory_repo.get(inventory_id)
        if not inventory:
            raise ValueError("Inventory not found")
        
        if inventory.current_quantity < quantity:
            raise ValueError(f"Insufficient stock. Available: {inventory.current_quantity}, Requested: {quantity}")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity - quantity
        
        # Create movement record
        await self._create_movement(
            inventory_id=inventory_id,
            movement_type=MovementType.REMOVE,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            reason=reason,
            performed_by=performed_by
        )
        
        # Update inventory
        inventory.current_quantity = new_quantity
        await self.db.commit()
        await self.db.refresh(inventory)
        
        await self._check_and_create_alerts(inventory)
        return inventory
    
    async def record_sale(
        self,
        brand_id: int,
        quantity: int,
        sale_id: int,
        performed_by: Optional[str] = None
    ) -> InventoryWithDetails:
        inventory = await self.inventory_repo.get_by_brand(brand_id)
        if not inventory:
            raise ValueError("Inventory not found for this brand")
        
        if inventory.current_quantity < quantity:
            raise ValueError(f"Insufficient stock. Available: {inventory.current_quantity}, Requested: {quantity}")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity - quantity
        
        # Create movement record
        await self._create_movement(
            inventory_id=inventory.inventory_id,
            movement_type=MovementType.SALE,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            reference_type="SALE",
            reference_id=sale_id,
            reason="Auto-deducted from sale",
            performed_by=performed_by
        )
        
        # Update inventory
        inventory.current_quantity = new_quantity
        await self.db.commit()
        await self.db.refresh(inventory)
        
        await self._check_and_create_alerts(inventory)
        return inventory
    
    async def record_damage(
        self,
        inventory_id: int,
        quantity: int,
        reason: Optional[str] = None,
        performed_by: Optional[str] = None
    ) -> InventoryWithDetails:
        inventory = await self.inventory_repo.get(inventory_id)
        if not inventory:
            raise ValueError("Inventory not found")
        
        if inventory.current_quantity < quantity:
            raise ValueError(f"Insufficient stock. Available: {inventory.current_quantity}, Requested: {quantity}")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity - quantity
        
        # Create movement record
        await self._create_movement(
            inventory_id=inventory_id,
            movement_type=MovementType.DAMAGE,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            reason=reason or "Damaged stock",
            performed_by=performed_by
        )
        
        # Update inventory
        inventory.current_quantity = new_quantity
        await self.db.commit()
        await self.db.refresh(inventory)
        
        await self._check_and_create_alerts(inventory)
        return inventory
    
    async def _create_movement(
        self,
        inventory_id: int,
        movement_type: MovementType,
        quantity: int,
        previous_quantity: int,
        new_quantity: int,
        reference_type: Optional[str] = None,
        reference_id: Optional[int] = None,
        reason: Optional[str] = None,
        performed_by: Optional[str] = None,
        notes: Optional[str] = None
    ):
        from app.models.inventory import InventoryMovement
        movement = InventoryMovement(
            inventory_id=inventory_id,
            movement_type=movement_type,
            quantity=quantity if movement_type in [MovementType.ADD, MovementType.RETURN] else -quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            reference_type=reference_type,
            reference_id=reference_id,
            reason=reason,
            performed_by=performed_by,
            notes=notes
        )
        self.db.add(movement)
        await self.db.commit()
    
    async def _check_and_create_alerts(self, inventory):
        from app.models.inventory import InventoryAlert
        
        alerts_to_create = []
        
        # Check low stock
        if inventory.current_quantity <= inventory.minimum_quantity and inventory.current_quantity > 0:
            if inventory.status != InventoryStatus.LOW_STOCK:
                inventory.status = InventoryStatus.LOW_STOCK
            alerts_to_create.append({
                "alert_type": AlertType.LOW_STOCK,
                "threshold_value": inventory.minimum_quantity,
                "current_value": inventory.current_quantity,
                "severity": "HIGH" if inventory.current_quantity < inventory.minimum_quantity * 0.5 else "MEDIUM",
                "message": f"Low stock alert: {inventory.current_quantity} items remaining (minimum: {inventory.minimum_quantity})"
            })
        
        # Check out of stock
        if inventory.current_quantity == 0:
            inventory.status = InventoryStatus.OUT_OF_STOCK
            alerts_to_create.append({
                "alert_type": AlertType.LOW_STOCK,
                "threshold_value": inventory.minimum_quantity,
                "current_value": 0,
                "severity": "CRITICAL",
                "message": "Out of stock alert: No items remaining"
            })
        
        # Check expiry
        if inventory.expiry_date:
            days_until_expiry = (inventory.expiry_date - datetime.now()).days
            
            # Expiring soon (within 30 days)
            if 0 < days_until_expiry <= 30:
                if inventory.status != InventoryStatus.EXPIRING_SOON:
                    inventory.status = InventoryStatus.EXPIRING_SOON
                alerts_to_create.append({
                    "alert_type": AlertType.EXPIRY_SOON,
                    "threshold_value": 30,
                    "current_value": days_until_expiry,
                    "severity": "HIGH" if days_until_expiry <= 7 else "MEDIUM",
                    "message": f"Expiring soon: {days_until_expiry} days until expiry"
                })
            
            # Expired
            elif days_until_expiry <= 0:
                inventory.status = InventoryStatus.EXPIRED
                alerts_to_create.append({
                    "alert_type": AlertType.EXPIRED,
                    "threshold_value": 0,
                    "current_value": days_until_expiry,
                    "severity": "CRITICAL",
                    "message": f"Expired: Item expired on {inventory.expiry_date.strftime('%Y-%m-%d')}"
                })
        
        # Check overstock
        if inventory.current_quantity >= inventory.maximum_quantity:
            alerts_to_create.append({
                "alert_type": AlertType.OVERSTOCK,
                "threshold_value": inventory.maximum_quantity,
                "current_value": inventory.current_quantity,
                "severity": "LOW",
                "message": f"Overstock alert: {inventory.current_quantity} items (maximum: {inventory.maximum_quantity})"
            })
        
        # Create alerts
        for alert_data in alerts_to_create:
            alert = InventoryAlert(
                inventory_id=inventory.inventory_id,
                **alert_data
            )
            self.db.add(alert)
        
        if alerts_to_create:
            await self.db.commit()
    
    async def get_dashboard_stats(self) -> dict:
        return await self.inventory_repo.get_stats()
    
    async def get_movement_history(self, inventory_id: int, limit: int = 50) -> List:
        from app.models.inventory import InventoryMovement
        result = await self.db.execute(
            select(InventoryMovement)
            .where(InventoryMovement.inventory_id == inventory_id)
            .order_by(InventoryMovement.created_at.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_active_alerts(self, unresolved_only: bool = True) -> List:
        from app.models.inventory import InventoryAlert
        query = select(InventoryAlert)
        if unresolved_only:
            query = query.where(InventoryAlert.is_resolved == False)
        query = query.order_by(InventoryAlert.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()
```

### 1.6 API Endpoints (`app/api/v1/endpoints/inventory.py`)
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.session import get_db
from app.schemas.inventory import (
    Inventory, InventoryCreate, InventoryUpdate, InventoryWithDetails,
    InventoryMovement, InventoryMovementCreate, InventoryAlert,
    InventoryStats
)
from app.services.inventory import InventoryService
from app.core.constants import InventoryStatus, AlertType

router = APIRouter()

@router.post("/", response_model=Inventory)
async def create_inventory(
    inventory: InventoryCreate,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.create_inventory(inventory)

@router.get("/", response_model=List[InventoryWithDetails])
async def list_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[InventoryStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.inventory_repo.list(skip=skip, limit=limit, status=status)

@router.get("/{inventory_id}", response_model=InventoryWithDetails)
async def get_inventory(
    inventory_id: int,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    inventory = await service.inventory_repo.get(inventory_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return inventory

@router.get("/brand/{brand_id}", response_model=Optional[InventoryWithDetails])
async def get_inventory_by_brand(
    brand_id: int,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    inventory = await service.inventory_repo.get_by_brand(brand_id)
    return inventory

@router.put("/{inventory_id}", response_model=InventoryWithDetails)
async def update_inventory(
    inventory_id: int,
    inventory: InventoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    updated = await service.update_inventory(inventory_id, inventory)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return updated

@router.delete("/{inventory_id}")
async def delete_inventory(
    inventory_id: int,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    success = await service.inventory_repo.delete(inventory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return {"message": "Inventory deleted successfully"}

@router.post("/{inventory_id}/add-stock", response_model=InventoryWithDetails)
async def add_stock(
    inventory_id: int,
    quantity: int = Query(..., gt=0),
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    reason: Optional[str] = None,
    performed_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.add_stock(
        inventory_id, quantity, reference_type, reference_id, reason, performed_by
    )

@router.post("/{inventory_id}/remove-stock", response_model=InventoryWithDetails)
async def remove_stock(
    inventory_id: int,
    quantity: int = Query(..., gt=0),
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    reason: Optional[str] = None,
    performed_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.remove_stock(
        inventory_id, quantity, reference_type, reference_id, reason, performed_by
    )

@router.post("/brand/{brand_id}/sale", response_model=InventoryWithDetails)
async def record_sale(
    brand_id: int,
    quantity: int = Query(..., gt=0),
    sale_id: int,
    performed_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.record_sale(brand_id, quantity, sale_id, performed_by)

@router.post("/{inventory_id}/damage", response_model=InventoryWithDetails)
async def record_damage(
    inventory_id: int,
    quantity: int = Query(..., gt=0),
    reason: Optional[str] = None,
    performed_by: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.record_damage(inventory_id, quantity, reason, performed_by)

@router.get("/stats/dashboard", response_model=InventoryStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    service = InventoryService(db)
    return await service.get_dashboard_stats()

@router.get("/{inventory_id}/movements", response_model=List[InventoryMovement])
async def get_movement_history(
    inventory_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.get_movement_history(inventory_id, limit)

@router.get("/alerts/active", response_model=List[InventoryAlert])
async def get_active_alerts(
    unresolved_only: bool = Query(True),
    db: AsyncSession = Depends(get_db)
):
    service = InventoryService(db)
    return await service.get_active_alerts(unresolved_only)

@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    resolved_by: str,
    db: AsyncSession = Depends(get_db)
):
    from app.models.inventory import InventoryAlert
    result = await db.execute(select(InventoryAlert).where(InventoryAlert.alert_id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = True
    alert.resolved_at = datetime.now()
    alert.resolved_by = resolved_by
    await db.commit()
    return {"message": "Alert resolved successfully"}
```

---

## 2. Database Migration

Create a migration file in `alembic/versions/`:
```python
"""Add inventory management tables

Revision ID: inventory_001
Revises: 
Create Date: 2025-01-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'inventory_001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create inventory table
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
        sa.ForeignKeyConstraint(['brand_id'], ['brand_names.brand_name_id'], ),
        sa.PrimaryKeyConstraint('inventory_id'),
        sa.UniqueConstraint('brand_id')
    )
    op.create_index('ix_inventory_brand_id', 'inventory', ['brand_id'])
    op.create_index('ix_inventory_inventory_id', 'inventory', ['inventory_id'])
    
    # Create inventory_movements table
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
    
    # Create inventory_alerts table
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
```

---

## 3. Frontend Implementation

### 3.1 Types (`frontend/src/types/inventory.ts`)
```typescript
export interface Inventory {
  inventory_id: number;
  brand_id: number;
  current_quantity: number;
  minimum_quantity: number;
  maximum_quantity: number;
  reorder_quantity: number;
  batch_number?: string;
  expiry_date?: string;
  manufacturing_date?: string;
  location?: string;
  status: InventoryStatus;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryWithDetails extends Inventory {
  brand_name: string;
  generic_name: string;
  manufacturer_name?: string;
  dosage_form?: string;
}

export interface InventoryMovement {
  movement_id: number;
  inventory_id: number;
  movement_type: MovementType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_type?: string;
  reference_id?: number;
  reason?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
}

export interface InventoryAlert {
  alert_id: number;
  inventory_id: number;
  alert_type: AlertType;
  threshold_value?: number;
  current_value?: number;
  severity: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  message?: string;
  created_at: string;
}

export interface InventoryStats {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  expiring_soon_items: number;
  expired_items: number;
  total_value?: number;
}

export type InventoryStatus = 'available' | 'low_stock' | 'out_of_stock' | 'expired' | 'expiring_soon' | 'damaged';
export type MovementType = 'add' | 'remove' | 'return' | 'damage' | 'sale' | 'adjustment' | 'transfer';
export type AlertType = 'low_stock' | 'expiry_soon' | 'expired' | 'overstock';
```

### 3.2 Service (`frontend/src/services/inventoryService.ts`)
```typescript
import axios from 'axios';
import type { Inventory, InventoryWithDetails, InventoryMovement, InventoryAlert, InventoryStats } from '../types/inventory';

const API_BASE = '/api/v1/inventory';

export const inventoryService = {
  // Inventory CRUD
  async list(params?: { skip?: number; limit?: number; status?: string }) {
    const response = await axios.get<InventoryWithDetails[]>(API_BASE, { params });
    return response.data;
  },

  async get(inventoryId: number) {
    const response = await axios.get<InventoryWithDetails>(`${API_BASE}/${inventoryId}`);
    return response.data;
  },

  async getByBrand(brandId: number) {
    const response = await axios.get<InventoryWithDetails | null>(`${API_BASE}/brand/${brandId}`);
    return response.data;
  },

  async create(data: Omit<Inventory, 'inventory_id' | 'created_at' | 'updated_at' | 'last_restocked_at'>) {
    const response = await axios.post<Inventory>(API_BASE, data);
    return response.data;
  },

  async update(inventoryId: number, data: Partial<Inventory>) {
    const response = await axios.put<InventoryWithDetails>(`${API_BASE}/${inventoryId}`, data);
    return response.data;
  },

  async delete(inventoryId: number) {
    await axios.delete(`${API_BASE}/${inventoryId}`);
  },

  // Stock operations
  async addStock(inventoryId: number, quantity: number, options?: {
    reference_type?: string;
    reference_id?: number;
    reason?: string;
    performed_by?: string;
  }) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/${inventoryId}/add-stock`, null, {
      params: { quantity, ...options }
    });
    return response.data;
  },

  async removeStock(inventoryId: number, quantity: number, options?: {
    reference_type?: string;
    reference_id?: number;
    reason?: string;
    performed_by?: string;
  }) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/${inventoryId}/remove-stock`, null, {
      params: { quantity, ...options }
    });
    return response.data;
  },

  async recordSale(brandId: number, quantity: number, saleId: number, performedBy?: string) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/brand/${brandId}/sale`, null, {
      params: { quantity, sale_id: saleId, performed_by: performedBy }
    });
    return response.data;
  },

  async recordDamage(inventoryId: number, quantity: number, reason?: string, performedBy?: string) {
    const response = await axios.post<InventoryWithDetails>(`${API_BASE}/${inventoryId}/damage`, null, {
      params: { quantity, reason, performed_by: performedBy }
    });
    return response.data;
  },

  // Stats and alerts
  async getDashboardStats() {
    const response = await axios.get<InventoryStats>(`${API_BASE}/stats/dashboard`);
    return response.data;
  },

  async getMovementHistory(inventoryId: number, limit = 50) {
    const response = await axios.get<InventoryMovement[]>(`${API_BASE}/${inventoryId}/movements`, {
      params: { limit }
    });
    return response.data;
  },

  async getActiveAlerts(unresolvedOnly = true) {
    const response = await axios.get<InventoryAlert[]>(`${API_BASE}/alerts/active`, {
      params: { unresolved_only: unresolvedOnly }
    });
    return response.data;
  },

  async resolveAlert(alertId: number, resolvedBy: string) {
    await axios.post(`${API_BASE}/alerts/${alertId}/resolve`, null, {
      params: { resolved_by: resolvedBy }
    });
  },
};
```

### 3.3 Pages

#### Inventory List Page (`frontend/src/pages/inventory/InventoryList.tsx`)
```typescript
import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryWithDetails, InventoryStats } from '../../types/inventory';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

export default function InventoryList() {
  const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'expiring_soon'>('all');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryData, statsData] = await Promise.all([
        inventoryService.list({ status: filter === 'all' ? undefined : filter }),
        inventoryService.getDashboardStats(),
      ]);
      setInventory(inventoryData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="جاري تحميل المخزون..." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Package className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إدارة المخزون</h1>
            <p className="text-sm text-muted-foreground">تتبع كميات الأدوية وحركات المخزن</p>
          </div>
        </div>
        <Link to="/inventory/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة صنف
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأصناف</p>
                <p className="text-2xl font-bold">{stats.total_items}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">منخفض المخزون</p>
                <p className="text-2xl font-bold">{stats.low_stock_items}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">نفذ من المخزون</p>
                <p className="text-2xl font-bold">{stats.out_of_stock_items}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">قارئ الانتهاء</p>
                <p className="text-2xl font-bold">{stats.expiring_soon_items}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'low_stock', 'out_of_stock', 'expiring_soon'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            {f === 'all' ? 'الكل' : f === 'low_stock' ? 'منخفض المخزون' : f === 'out_of_stock' ? 'نفذ من المخزون' : 'قارئ الانتهاء'}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-right">اسم الدواء</th>
              <th className="px-4 py-3 text-right">الكمية الحالية</th>
              <th className="px-4 py-3 text-right">الحد الأدنى</th>
              <th className="px-4 py-3 text-right">الحالة</th>
              <th className="px-4 py-3 text-right">تاريخ الانتهاء</th>
              <th className="px-4 py-3 text-right">الموقع</th>
              <th className="px-4 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.inventory_id} className="border-t">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{item.brand_name}</p>
                    <p className="text-sm text-muted-foreground">{item.generic_name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{item.current_quantity}</td>
                <td className="px-4 py-3">{item.minimum_quantity}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'available' ? 'bg-green-100 text-green-700' :
                    item.status === 'low_stock' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'out_of_stock' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('ar-IQ') : '-'}
                </td>
                <td className="px-4 py-3">{item.location || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link to={`/inventory/${item.inventory_id}`}>
                      <button className="p-2 hover:bg-muted rounded-lg">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 3.4 Update Brand Detail Page
Add inventory section to `frontend/src/pages/brands/BrandDetail.tsx`:
```typescript
// Add after Prices section
{/* Inventory Card */}
<div className="bg-card rounded-xl border p-6">
  <div className="flex items-center justify-between mb-4 pb-3 border-b">
    <h2 className="font-semibold flex items-center gap-2">
      <Package className="h-4 w-4 text-primary" />
      المخزون
    </h2>
    {inventory ? (
      <Button variant="outline" size="sm" onClick={() => setStockModalOpen(true)}>
        تحديث المخزون
      </Button>
    ) : (
      <Button size="sm" onClick={() => setStockModalOpen(true)}>
        إضافة مخزون
      </Button>
    )}
  </div>

  {inventory ? (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">الكمية الحالية</p>
          <p className="text-2xl font-bold">{inventory.current_quantity}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">الحد الأدنى</p>
          <p className="text-2xl font-bold">{inventory.minimum_quantity}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">الحد الأقصى</p>
          <p className="text-2xl font-bold">{inventory.maximum_quantity}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">الحالة</p>
          <p className="text-2xl font-bold">{inventory.status}</p>
        </div>
      </div>

      {inventory.expiry_date && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            تاريخ الانتهاء: {new Date(inventory.expiry_date).toLocaleDateString('ar-IQ')}
          </p>
        </div>
      )}

      <Button onClick={() => setMovementModalOpen(true)} className="w-full">
        عرض سجل الحركات
      </Button>
    </div>
  ) : (
    <div className="text-center py-8 text-muted-foreground">
      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>لا يوجد مخزون لهذا الدواء</p>
    </div>
  )}
</div>
```

---

## 4. Integration Steps

### 4.1 Update Brand Model
Add relationship to Inventory in `app/models/brand.py`:
```python
# Add to BrandName class
inventory = relationship("Inventory", back_populates="brand", uselist=False)
```

### 4.2 Update Router
Add inventory routes to `frontend/src/router.tsx`:
```typescript
const InventoryList = lazy(() => import('./pages/inventory/InventoryList'));
const InventoryDetail = lazy(() => import('./pages/inventory/InventoryDetail'));
const InventoryForm = lazy(() => import('./pages/inventory/InventoryForm'));

// Add to routes
{ path: 'inventory', element: <Suspense fallback={<Loading />}><InventoryList /></Suspense> },
{ path: 'inventory/new', element: <Suspense fallback={<Loading />}><InventoryForm /></Suspense> },
{ path: 'inventory/:id', element: <Suspense fallback={<Loading />}><InventoryDetail /></Suspense> },
```

### 4.3 Update Sidebar
Add inventory link to `frontend/src/components/layout/Sidebar.tsx`:
```typescript
const navigation = [
  // ... existing items
  { name: 'المخزون', href: '/inventory', icon: Package },
  // ...
];
```

---

## 5. Testing Checklist

- [ ] Create inventory record successfully
- [ ] Update inventory quantities
- [ ] Add stock movement
- [ ] Remove stock movement
- [ ] Record sale with auto-deduction
- [ ] Record damaged stock
- [ ] Low stock alert triggers
- [ ] Expiry alert triggers
- [ ] Out of stock alert triggers
- [ ] View movement history
- [ ] View active alerts
- [ ] Resolve alerts
- [ ] Dashboard stats display correctly
- [ ] Frontend pages load correctly
- [ ] Print inventory reports

---

## 6. Additional Notes

- Use Arabic labels for all UI elements
- Ensure RTL direction for Arabic text
- Implement proper error handling
- Add loading states for all async operations
- Use toast notifications for user feedback
- Implement proper date formatting for Arabic locale
- Ensure data validation on both frontend and backend
