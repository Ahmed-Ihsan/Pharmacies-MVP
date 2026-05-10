from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from app.repositories.inventory import InventoryRepository
from app.schemas.inventory import (
    InventoryCreate, InventoryUpdate, InventoryMovementCreate, 
    InventoryWithDetails
)
from app.models.inventory import Inventory
from app.core.constants import MovementType, AlertType, InventoryStatus


class InventoryService:
    def __init__(self, db: Session):
        self.db = db
        self.inventory_repo = InventoryRepository()
    
    def create_inventory(self, inventory: InventoryCreate) -> Inventory:
        db_inventory = self.inventory_repo.create(self.db, obj_in=inventory)
        self._check_and_create_alerts(db_inventory)
        return db_inventory
    
    def update_inventory(self, inventory_id: int, inventory: InventoryUpdate) -> Optional[Inventory]:
        db_inventory = self.inventory_repo.get(self.db, inventory_id)
        if not db_inventory:
            return None
        
        updated = self.inventory_repo.update(self.db, db_obj=db_inventory, obj_in=inventory)
        if updated:
            self._check_and_create_alerts(updated)
        return updated
    
    def add_stock(
        self, 
        inventory_id: int, 
        quantity: int, 
        reference_type: Optional[str] = None,
        reference_id: Optional[int] = None,
        reason: Optional[str] = None,
        performed_by: Optional[str] = None
    ) -> Inventory:
        inventory = self.inventory_repo.get(self.db, inventory_id)
        if not inventory:
            raise ValueError("Inventory not found")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity + quantity
        
        self._create_movement(
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
        
        inventory.current_quantity = new_quantity
        inventory.last_restocked_at = datetime.now()
        self.db.commit()
        self.db.refresh(inventory)
        
        self._check_and_create_alerts(inventory)
        return inventory
    
    def remove_stock(
        self,
        inventory_id: int,
        quantity: int,
        reference_type: Optional[str] = None,
        reference_id: Optional[int] = None,
        reason: Optional[str] = None,
        performed_by: Optional[str] = None
    ) -> Inventory:
        inventory = self.inventory_repo.get(self.db, inventory_id)
        if not inventory:
            raise ValueError("Inventory not found")
        
        if inventory.current_quantity < quantity:
            raise ValueError(f"Insufficient stock. Available: {inventory.current_quantity}, Requested: {quantity}")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity - quantity
        
        self._create_movement(
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
        
        inventory.current_quantity = new_quantity
        self.db.commit()
        self.db.refresh(inventory)
        
        self._check_and_create_alerts(inventory)
        return inventory
    
    def record_sale(
        self,
        brand_id: int,
        quantity: int,
        sale_id: int,
        performed_by: Optional[str] = None
    ) -> Inventory:
        inventory = self.inventory_repo.get_by_brand(self.db, brand_id)
        if not inventory:
            raise ValueError("Inventory not found for this brand")
        
        if inventory.current_quantity < quantity:
            raise ValueError(f"Insufficient stock. Available: {inventory.current_quantity}, Requested: {quantity}")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity - quantity
        
        self._create_movement(
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
        
        inventory.current_quantity = new_quantity
        self.db.commit()
        self.db.refresh(inventory)
        
        self._check_and_create_alerts(inventory)
        return inventory
    
    def record_damage(
        self,
        inventory_id: int,
        quantity: int,
        reason: Optional[str] = None,
        performed_by: Optional[str] = None
    ) -> Inventory:
        inventory = self.inventory_repo.get(self.db, inventory_id)
        if not inventory:
            raise ValueError("Inventory not found")
        
        if inventory.current_quantity < quantity:
            raise ValueError(f"Insufficient stock. Available: {inventory.current_quantity}, Requested: {quantity}")
        
        previous_quantity = inventory.current_quantity
        new_quantity = previous_quantity - quantity
        
        self._create_movement(
            inventory_id=inventory_id,
            movement_type=MovementType.DAMAGE,
            quantity=quantity,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            reason=reason or "Damaged stock",
            performed_by=performed_by
        )
        
        inventory.current_quantity = new_quantity
        self.db.commit()
        self.db.refresh(inventory)
        
        self._check_and_create_alerts(inventory)
        return inventory
    
    def _create_movement(
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
        self.db.commit()
    
    def _check_and_create_alerts(self, inventory):
        from app.models.inventory import InventoryAlert
        
        alerts_to_create = []
        
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
        
        if inventory.current_quantity == 0:
            inventory.status = InventoryStatus.OUT_OF_STOCK
            alerts_to_create.append({
                "alert_type": AlertType.LOW_STOCK,
                "threshold_value": inventory.minimum_quantity,
                "current_value": 0,
                "severity": "CRITICAL",
                "message": "Out of stock alert: No items remaining"
            })
        
        if inventory.expiry_date:
            days_until_expiry = (inventory.expiry_date - datetime.now()).days
            
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
            
            elif days_until_expiry <= 0:
                inventory.status = InventoryStatus.EXPIRED
                alerts_to_create.append({
                    "alert_type": AlertType.EXPIRED,
                    "threshold_value": 0,
                    "current_value": days_until_expiry,
                    "severity": "CRITICAL",
                    "message": f"Expired: Item expired on {inventory.expiry_date.strftime('%Y-%m-%d')}"
                })
        
        if inventory.current_quantity >= inventory.maximum_quantity:
            alerts_to_create.append({
                "alert_type": AlertType.OVERSTOCK,
                "threshold_value": inventory.maximum_quantity,
                "current_value": inventory.current_quantity,
                "severity": "LOW",
                "message": f"Overstock alert: {inventory.current_quantity} items (maximum: {inventory.maximum_quantity})"
            })
        
        for alert_data in alerts_to_create:
            alert = InventoryAlert(
                inventory_id=inventory.inventory_id,
                **alert_data
            )
            self.db.add(alert)
        
        if alerts_to_create:
            self.db.commit()
    
    def get_dashboard_stats(self) -> dict:
        return self.inventory_repo.get_stats(self.db)
    
    def get_movement_history(self, inventory_id: int, limit: int = 50) -> List:
        from app.models.inventory import InventoryMovement
        return (
            self.db.query(InventoryMovement)
            .filter(InventoryMovement.inventory_id == inventory_id)
            .order_by(InventoryMovement.created_at.desc())
            .limit(limit)
            .all()
        )
    
    def get_active_alerts(self, unresolved_only: bool = True) -> List:
        from app.models.inventory import InventoryAlert
        query = self.db.query(InventoryAlert)
        if unresolved_only:
            query = query.filter(InventoryAlert.is_resolved == False)
        return query.order_by(InventoryAlert.created_at.desc()).all()
