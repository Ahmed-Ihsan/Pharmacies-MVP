"""Tests for InventoryService."""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.services.inventory import InventoryService
from app.repositories.inventory import InventoryRepository
from app.repositories.brand import brand_repository
from app.repositories.generic import generic_repository
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from app.schemas.brand import BrandNameCreate
from app.schemas.generic import GenericDrugCreate
from app.core.constants import InventoryStatus, MovementType, AlertType


class TestInventoryService:
    """Test suite for InventoryService."""
    
    @pytest.fixture
    def create_brand(self, db_session: Session):
        """Create required brand dependency."""
        generic_data = {
            "generic_name": "Paracetamol",
            "cas_number": "103-90-2",
        }
        generic = generic_repository.create(
            db_session,
            obj_in=GenericDrugCreate(**generic_data)
        )
        
        brand_data = {
            "brand_name": "Tylenol",
            "generic_id": generic.generic_id,
            "strength_value": 500,
            "strength_unit": "mg",
        }
        brand = brand_repository.create(
            db_session,
            obj_in=BrandNameCreate(**brand_data)
        )
        
        return brand.brand_id
    
    @pytest.fixture
    def sample_inventory_data(self, create_brand):
        """Sample inventory data."""
        return {
            "brand_id": create_brand,
            "current_quantity": 100,
            "minimum_quantity": 10,
            "maximum_quantity": 1000,
            "reorder_quantity": 50,
            "batch_number": "B001",
            "expiry_date": datetime.now() + timedelta(days=365),
            "location": "A1",
            "status": InventoryStatus.AVAILABLE,
        }
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_inventory(self, db_session: Session, sample_inventory_data):
        """Test creating inventory."""
        service = InventoryService(db_session)
        inventory = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        assert inventory.inventory_id is not None
        assert inventory.brand_id == sample_inventory_data["brand_id"]
        assert inventory.current_quantity == 100
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_update_inventory(self, db_session: Session, sample_inventory_data):
        """Test updating inventory."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        update_data = InventoryUpdate(current_quantity=200)
        updated = service.update_inventory(created.inventory_id, update_data)
        
        assert updated is not None
        assert updated.current_quantity == 200
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_add_stock(self, db_session: Session, sample_inventory_data):
        """Test adding stock."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        result = service.add_stock(
            inventory_id=created.inventory_id,
            quantity=50,
            reason="Restock"
        )
        
        assert result.current_quantity == 150
        assert result.last_restocked_at is not None
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_remove_stock(self, db_session: Session, sample_inventory_data):
        """Test removing stock."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        result = service.remove_stock(
            inventory_id=created.inventory_id,
            quantity=30,
            reason="Adjustment"
        )
        
        assert result.current_quantity == 70
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_remove_stock_insufficient(self, db_session: Session, sample_inventory_data):
        """Test removing stock with insufficient quantity."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        with pytest.raises(ValueError, match="Insufficient stock"):
            service.remove_stock(
                inventory_id=created.inventory_id,
                quantity=200,
                reason="Adjustment"
            )
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_record_sale(self, db_session: Session, sample_inventory_data):
        """Test recording a sale."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        result = service.record_sale(
            brand_id=created.brand_id,
            quantity=10,
            sale_id=1,
            performed_by="cashier1"
        )
        
        assert result.current_quantity == 90
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_record_sale_insufficient_stock(self, db_session: Session, sample_inventory_data):
        """Test recording a sale with insufficient stock."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        with pytest.raises(ValueError, match="Insufficient stock"):
            service.record_sale(
                brand_id=created.brand_id,
                quantity=200,
                sale_id=1,
                performed_by="cashier1"
            )
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_record_damage(self, db_session: Session, sample_inventory_data):
        """Test recording damaged stock."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        result = service.record_damage(
            inventory_id=created.inventory_id,
            quantity=5,
            reason="Broken bottle"
        )
        
        assert result.current_quantity == 95
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_dashboard_stats(self, db_session: Session, sample_inventory_data):
        """Test getting dashboard statistics."""
        service = InventoryService(db_session)
        service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        stats = service.get_dashboard_stats()
        
        assert "total_items" in stats
        assert "low_stock_items" in stats
        assert "out_of_stock_items" in stats
        assert stats["total_items"] >= 1
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_movement_history(self, db_session: Session, sample_inventory_data):
        """Test getting movement history."""
        service = InventoryService(db_session)
        created = service.create_inventory(InventoryCreate(**sample_inventory_data))
        
        service.add_stock(created.inventory_id, 50, reason="Restock")
        service.remove_stock(created.inventory_id, 10, reason="Adjustment")
        
        movements = service.get_movement_history(created.inventory_id)
        
        assert len(movements) >= 2
        assert movements[0].movement_type in [MovementType.ADD, MovementType.REMOVE]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_active_alerts(self, db_session: Session, sample_inventory_data):
        """Test getting active alerts."""
        service = InventoryService(db_session)
        
        # Create inventory with low stock
        data = {**sample_inventory_data, "current_quantity": 5, "minimum_quantity": 10}
        created = service.create_inventory(InventoryCreate(**data))
        
        alerts = service.get_active_alerts(unresolved_only=True)
        
        # Should have at least one low stock alert
        assert len(alerts) >= 1
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_low_stock_alert_creation(self, db_session: Session, sample_inventory_data):
        """Test that low stock alerts are created automatically."""
        service = InventoryService(db_session)
        
        # Create inventory with low stock
        data = {**sample_inventory_data, "current_quantity": 5, "minimum_quantity": 10}
        created = service.create_inventory(InventoryCreate(**data))
        
        # Check that status was updated
        assert created.status == InventoryStatus.LOW_STOCK
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_out_of_stock_alert_creation(self, db_session: Session, sample_inventory_data):
        """Test that out of stock alerts are created automatically."""
        service = InventoryService(db_session)
        
        # Create inventory with zero stock
        data = {**sample_inventory_data, "current_quantity": 0, "minimum_quantity": 10}
        created = service.create_inventory(InventoryCreate(**data))
        
        # Check that status was updated
        assert created.status == InventoryStatus.OUT_OF_STOCK
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_expiry_alert_creation(self, db_session: Session, sample_inventory_data):
        """Test that expiry alerts are created automatically."""
        service = InventoryService(db_session)
        
        # Create inventory expiring soon
        data = {
            **sample_inventory_data,
            "expiry_date": datetime.now() + timedelta(days=15),
            "current_quantity": 50,
        }
        created = service.create_inventory(InventoryCreate(**data))
        
        # Check that status was updated
        assert created.status == InventoryStatus.EXPIRING_SOON
