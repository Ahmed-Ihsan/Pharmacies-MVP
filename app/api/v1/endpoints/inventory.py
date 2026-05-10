from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.api.v1.deps.dependencies import get_db
from app.schemas.inventory import (
    Inventory, InventoryCreate, InventoryUpdate, InventoryWithDetails,
    InventoryMovement, InventoryMovementCreate, InventoryAlert,
    InventoryStats
)
from app.services.inventory import InventoryService
from app.core.constants import InventoryStatus

router = APIRouter()


@router.post("/", response_model=None)
async def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    result = service.create_inventory(inventory)
    return {
        "inventory_id": result.inventory_id,
        "brand_id": result.brand_id,
        "current_quantity": result.current_quantity,
        "minimum_quantity": result.minimum_quantity,
        "maximum_quantity": result.maximum_quantity,
        "reorder_quantity": result.reorder_quantity,
        "batch_number": result.batch_number,
        "expiry_date": result.expiry_date.isoformat() if result.expiry_date else None,
        "manufacturing_date": result.manufacturing_date.isoformat() if result.manufacturing_date else None,
        "location": result.location,
        "status": result.status.value if result.status else None,
        "last_restocked_at": result.last_restocked_at.isoformat() if result.last_restocked_at else None,
        "created_at": result.created_at.isoformat() if result.created_at else None,
        "updated_at": result.updated_at.isoformat() if result.updated_at else None,
    }


@router.get("/", response_model=List)
async def list_inventory(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[InventoryStatus] = None,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    return service.inventory_repo.list_with_details(db, skip=skip, limit=limit, status=status)


@router.get("/{inventory_id}")
async def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    inventory = service.inventory_repo.get(db, inventory_id)
    if not inventory:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return {
        "inventory_id": inventory.inventory_id,
        "brand_id": inventory.brand_id,
        "current_quantity": inventory.current_quantity,
        "minimum_quantity": inventory.minimum_quantity,
        "maximum_quantity": inventory.maximum_quantity,
        "reorder_quantity": inventory.reorder_quantity,
        "batch_number": inventory.batch_number,
        "expiry_date": inventory.expiry_date.isoformat() if inventory.expiry_date else None,
        "manufacturing_date": inventory.manufacturing_date.isoformat() if inventory.manufacturing_date else None,
        "location": inventory.location,
        "status": inventory.status.value if inventory.status else None,
        "last_restocked_at": inventory.last_restocked_at.isoformat() if inventory.last_restocked_at else None,
        "created_at": inventory.created_at.isoformat() if inventory.created_at else None,
        "updated_at": inventory.updated_at.isoformat() if inventory.updated_at else None,
    }


@router.get("/brand/{brand_id}")
async def get_inventory_by_brand(
    brand_id: int,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    inventory = service.inventory_repo.get_by_brand(db, brand_id)
    if not inventory:
        return None
    return {
        "inventory_id": inventory.inventory_id,
        "brand_id": inventory.brand_id,
        "current_quantity": inventory.current_quantity,
        "minimum_quantity": inventory.minimum_quantity,
        "maximum_quantity": inventory.maximum_quantity,
        "reorder_quantity": inventory.reorder_quantity,
        "batch_number": inventory.batch_number,
        "expiry_date": inventory.expiry_date.isoformat() if inventory.expiry_date else None,
        "manufacturing_date": inventory.manufacturing_date.isoformat() if inventory.manufacturing_date else None,
        "location": inventory.location,
        "status": inventory.status.value if inventory.status else None,
        "last_restocked_at": inventory.last_restocked_at.isoformat() if inventory.last_restocked_at else None,
        "created_at": inventory.created_at.isoformat() if inventory.created_at else None,
        "updated_at": inventory.updated_at.isoformat() if inventory.updated_at else None,
    }


@router.put("/{inventory_id}")
async def update_inventory(
    inventory_id: int,
    inventory: InventoryUpdate,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    updated = service.update_inventory(inventory_id, inventory)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return {
        "inventory_id": updated.inventory_id,
        "brand_id": updated.brand_id,
        "current_quantity": updated.current_quantity,
        "minimum_quantity": updated.minimum_quantity,
        "maximum_quantity": updated.maximum_quantity,
        "reorder_quantity": updated.reorder_quantity,
        "batch_number": updated.batch_number,
        "expiry_date": updated.expiry_date.isoformat() if updated.expiry_date else None,
        "manufacturing_date": updated.manufacturing_date.isoformat() if updated.manufacturing_date else None,
        "location": updated.location,
        "status": updated.status.value if updated.status else None,
        "last_restocked_at": updated.last_restocked_at.isoformat() if updated.last_restocked_at else None,
        "created_at": updated.created_at.isoformat() if updated.created_at else None,
        "updated_at": updated.updated_at.isoformat() if updated.updated_at else None,
    }


@router.delete("/{inventory_id}")
async def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    success = service.inventory_repo.delete(db, inventory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return {"message": "Inventory deleted successfully"}


@router.post("/{inventory_id}/add-stock")
async def add_stock(
    inventory_id: int,
    quantity: int = Query(..., gt=0),
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    reason: Optional[str] = None,
    performed_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    result = service.add_stock(
        inventory_id, quantity, reference_type, reference_id, reason, performed_by
    )
    return {
        "inventory_id": result.inventory_id,
        "brand_id": result.brand_id,
        "current_quantity": result.current_quantity,
        "minimum_quantity": result.minimum_quantity,
        "maximum_quantity": result.maximum_quantity,
        "reorder_quantity": result.reorder_quantity,
        "batch_number": result.batch_number,
        "expiry_date": result.expiry_date.isoformat() if result.expiry_date else None,
        "manufacturing_date": result.manufacturing_date.isoformat() if result.manufacturing_date else None,
        "location": result.location,
        "status": result.status.value if result.status else None,
        "last_restocked_at": result.last_restocked_at.isoformat() if result.last_restocked_at else None,
        "created_at": result.created_at.isoformat() if result.created_at else None,
        "updated_at": result.updated_at.isoformat() if result.updated_at else None,
    }


@router.post("/{inventory_id}/remove-stock")
async def remove_stock(
    inventory_id: int,
    quantity: int = Query(..., gt=0),
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
    reason: Optional[str] = None,
    performed_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    result = service.remove_stock(
        inventory_id, quantity, reference_type, reference_id, reason, performed_by
    )
    return {
        "inventory_id": result.inventory_id,
        "brand_id": result.brand_id,
        "current_quantity": result.current_quantity,
        "minimum_quantity": result.minimum_quantity,
        "maximum_quantity": result.maximum_quantity,
        "reorder_quantity": result.reorder_quantity,
        "batch_number": result.batch_number,
        "expiry_date": result.expiry_date.isoformat() if result.expiry_date else None,
        "manufacturing_date": result.manufacturing_date.isoformat() if result.manufacturing_date else None,
        "location": result.location,
        "status": result.status.value if result.status else None,
        "last_restocked_at": result.last_restocked_at.isoformat() if result.last_restocked_at else None,
        "created_at": result.created_at.isoformat() if result.created_at else None,
        "updated_at": result.updated_at.isoformat() if result.updated_at else None,
    }


@router.post("/brand/{brand_id}/sale")
async def record_sale(
    brand_id: int,
    quantity: int = Query(..., gt=0),
    sale_id: int = Query(...),
    performed_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    result = service.record_sale(brand_id, quantity, sale_id, performed_by)
    return {
        "inventory_id": result.inventory_id,
        "brand_id": result.brand_id,
        "current_quantity": result.current_quantity,
        "minimum_quantity": result.minimum_quantity,
        "maximum_quantity": result.maximum_quantity,
        "reorder_quantity": result.reorder_quantity,
        "batch_number": result.batch_number,
        "expiry_date": result.expiry_date.isoformat() if result.expiry_date else None,
        "manufacturing_date": result.manufacturing_date.isoformat() if result.manufacturing_date else None,
        "location": result.location,
        "status": result.status.value if result.status else None,
        "last_restocked_at": result.last_restocked_at.isoformat() if result.last_restocked_at else None,
        "created_at": result.created_at.isoformat() if result.created_at else None,
        "updated_at": result.updated_at.isoformat() if result.updated_at else None,
    }


@router.post("/{inventory_id}/damage")
async def record_damage(
    inventory_id: int,
    quantity: int = Query(..., gt=0),
    reason: Optional[str] = None,
    performed_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    result = service.record_damage(inventory_id, quantity, reason, performed_by)
    return {
        "inventory_id": result.inventory_id,
        "brand_id": result.brand_id,
        "current_quantity": result.current_quantity,
        "minimum_quantity": result.minimum_quantity,
        "maximum_quantity": result.maximum_quantity,
        "reorder_quantity": result.reorder_quantity,
        "batch_number": result.batch_number,
        "expiry_date": result.expiry_date.isoformat() if result.expiry_date else None,
        "manufacturing_date": result.manufacturing_date.isoformat() if result.manufacturing_date else None,
        "location": result.location,
        "status": result.status.value if result.status else None,
        "last_restocked_at": result.last_restocked_at.isoformat() if result.last_restocked_at else None,
        "created_at": result.created_at.isoformat() if result.created_at else None,
        "updated_at": result.updated_at.isoformat() if result.updated_at else None,
    }


@router.get("/stats/dashboard", response_model=InventoryStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    service = InventoryService(db)
    return service.get_dashboard_stats()


@router.get("/{inventory_id}/movements", response_model=List[InventoryMovement])
async def get_movement_history(
    inventory_id: int,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    return service.get_movement_history(inventory_id, limit)


@router.get("/alerts/active", response_model=List[InventoryAlert])
async def get_active_alerts(
    unresolved_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    service = InventoryService(db)
    return service.get_active_alerts(unresolved_only)


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    resolved_by: str,
    db: Session = Depends(get_db)
):
    from app.models.inventory import InventoryAlert
    
    alert = db.query(InventoryAlert).filter(InventoryAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_resolved = True
    alert.resolved_at = datetime.now()
    alert.resolved_by = resolved_by
    db.commit()
    return {"message": "Alert resolved successfully"}
