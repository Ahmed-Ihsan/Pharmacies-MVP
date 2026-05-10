from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func
from datetime import datetime, timedelta
from typing import List, Optional
from app.models.inventory import Inventory, InventoryMovement, InventoryAlert
from app.core.constants import InventoryStatus
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from app.repositories.base import BaseRepository


class InventoryRepository(BaseRepository[Inventory, InventoryCreate, InventoryUpdate]):
    def __init__(self):
        super().__init__(Inventory)
    
    def get_by_brand(self, db: Session, brand_id: int) -> Optional[Inventory]:
        return db.query(Inventory).filter(Inventory.brand_id == brand_id).first()
    
    def list(self, db: Session, skip: int = 0, limit: int = 100, status: Optional[InventoryStatus] = None) -> List[Inventory]:
        query = db.query(Inventory)
        if status:
            query = query.filter(Inventory.status == status)
        return query.offset(skip).limit(limit).all()
    
    def list_with_details(self, db: Session, skip: int = 0, limit: int = 100, status: Optional[InventoryStatus] = None) -> List:
        from app.models.brand import BrandName
        from app.models.generic import GenericDrug
        
        query = (
            db.query(Inventory, BrandName.brand_name, GenericDrug.generic_name)
            .join(BrandName, Inventory.brand_id == BrandName.brand_id)
            .join(GenericDrug, BrandName.generic_id == GenericDrug.generic_id)
        )
        
        if status:
            query = query.filter(Inventory.status == status)
        
        query = query.offset(skip).limit(limit)
        result = query.all()
        
        items = []
        for row in result:
            inventory, brand_name, generic_name = row
            items.append({
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
                "brand_name": brand_name,
                "generic_name": generic_name
            })
        
        return items
    
    def get_low_stock(self, db: Session) -> List[Inventory]:
        return db.query(Inventory).filter(
            and_(
                Inventory.current_quantity <= Inventory.minimum_quantity,
                Inventory.current_quantity > 0
            )
        ).all()
    
    def get_out_of_stock(self, db: Session) -> List[Inventory]:
        return db.query(Inventory).filter(Inventory.current_quantity == 0).all()
    
    def get_expiring_soon(self, db: Session, days: int = 30) -> List[Inventory]:
        expiry_threshold = datetime.now() + timedelta(days=days)
        return db.query(Inventory).filter(
            and_(
                Inventory.expiry_date <= expiry_threshold,
                Inventory.expiry_date > datetime.now(),
                Inventory.current_quantity > 0
            )
        ).all()
    
    def get_expired(self, db: Session) -> List[Inventory]:
        return db.query(Inventory).filter(
            and_(
                Inventory.expiry_date < datetime.now(),
                Inventory.current_quantity > 0
            )
        ).all()
    
    def get_stats(self, db: Session) -> dict:
        total = db.query(func.count(Inventory.inventory_id)).scalar()
        low_stock = db.query(func.count(Inventory.inventory_id)).filter(
            Inventory.current_quantity <= Inventory.minimum_quantity
        ).scalar()
        out_of_stock = db.query(func.count(Inventory.inventory_id)).filter(
            Inventory.current_quantity == 0
        ).scalar()
        expiring_soon = db.query(func.count(Inventory.inventory_id)).filter(
            and_(
                Inventory.expiry_date <= datetime.now() + timedelta(days=30),
                Inventory.expiry_date > datetime.now()
            )
        ).scalar()
        expired = db.query(func.count(Inventory.inventory_id)).filter(
            Inventory.expiry_date < datetime.now()
        ).scalar()
        
        return {
            "total_items": total,
            "low_stock_items": low_stock,
            "out_of_stock_items": out_of_stock,
            "expiring_soon_items": expiring_soon,
            "expired_items": expired,
        }
