"""Tests for InventoryRepository."""
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.repositories.inventory import InventoryRepository
from app.repositories.brand import brand_repository
from app.repositories.generic import generic_repository
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from app.schemas.brand import BrandNameCreate
from app.schemas.generic import GenericDrugCreate
from app.core.constants import InventoryStatus


class TestInventoryRepository:
    """Test suite for InventoryRepository."""
    
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
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_create_inventory(self, db_session: Session, sample_inventory_data):
        """Test creating inventory."""
        repo = InventoryRepository()
        inventory = repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        assert inventory.inventory_id is not None
        assert inventory.brand_id == sample_inventory_data["brand_id"]
        assert inventory.current_quantity == 100
        assert inventory.minimum_quantity == 10
        assert inventory.batch_number == "B001"
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_inventory(self, db_session: Session, sample_inventory_data):
        """Test getting inventory by ID."""
        repo = InventoryRepository()
        created = repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        fetched = repo.get(db_session, created.inventory_id)
        
        assert fetched is not None
        assert fetched.inventory_id == created.inventory_id
        assert fetched.current_quantity == created.current_quantity
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_brand(self, db_session: Session, sample_inventory_data, create_brand):
        """Test getting inventory by brand ID."""
        repo = InventoryRepository()
        repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        fetched = repo.get_by_brand(db_session, create_brand)
        
        assert fetched is not None
        assert fetched.brand_id == create_brand
        assert fetched.current_quantity == 100
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_list_inventory(self, db_session: Session, sample_inventory_data):
        """Test listing all inventory items."""
        repo = InventoryRepository()
        repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        items = repo.list(db_session)
        
        assert len(items) >= 1
        assert items[0].current_quantity == 100
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_list_with_status_filter(self, db_session: Session, sample_inventory_data):
        """Test listing inventory with status filter."""
        repo = InventoryRepository()
        repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        items = repo.list(db_session, status=InventoryStatus.AVAILABLE)
        
        assert len(items) >= 1
        assert all(item.status == InventoryStatus.AVAILABLE for item in items)
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_update_inventory(self, db_session: Session, sample_inventory_data):
        """Test updating inventory."""
        repo = InventoryRepository()
        created = repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        update_data = InventoryUpdate(current_quantity=200)
        updated = repo.update(db_session, db_obj=created, obj_in=update_data)
        
        assert updated is not None
        assert updated.current_quantity == 200
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_delete_inventory(self, db_session: Session, sample_inventory_data):
        """Test deleting inventory."""
        repo = InventoryRepository()
        created = repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        deleted = repo.remove(db_session, id=created.inventory_id)
        
        assert deleted is not None
        assert deleted.inventory_id == created.inventory_id
        
        # Verify deletion
        fetched = repo.get(db_session, created.inventory_id)
        assert fetched is None
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_low_stock(self, db_session: Session, sample_inventory_data):
        """Test getting low stock items."""
        repo = InventoryRepository()
        data = {**sample_inventory_data, "current_quantity": 5, "minimum_quantity": 10}
        repo.create(db_session, obj_in=InventoryCreate(**data))
        
        low_stock = repo.get_low_stock(db_session)
        
        assert len(low_stock) >= 1
        assert low_stock[0].current_quantity <= low_stock[0].minimum_quantity
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_out_of_stock(self, db_session: Session, sample_inventory_data):
        """Test getting out of stock items."""
        repo = InventoryRepository()
        data = {**sample_inventory_data, "current_quantity": 0}
        repo.create(db_session, obj_in=InventoryCreate(**data))
        
        out_of_stock = repo.get_out_of_stock(db_session)
        
        assert len(out_of_stock) >= 1
        assert out_of_stock[0].current_quantity == 0
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_expiring_soon(self, db_session: Session, sample_inventory_data):
        """Test getting items expiring soon."""
        repo = InventoryRepository()
        data = {
            **sample_inventory_data,
            "expiry_date": datetime.now() + timedelta(days=15),
            "current_quantity": 50,
        }
        repo.create(db_session, obj_in=InventoryCreate(**data))
        
        expiring_soon = repo.get_expiring_soon(db_session, days=30)
        
        assert len(expiring_soon) >= 1
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_expired(self, db_session: Session, sample_inventory_data):
        """Test getting expired items."""
        repo = InventoryRepository()
        data = {
            **sample_inventory_data,
            "expiry_date": datetime.now() - timedelta(days=10),
            "current_quantity": 50,
        }
        repo.create(db_session, obj_in=InventoryCreate(**data))
        
        expired = repo.get_expired(db_session)
        
        assert len(expired) >= 1
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_stats(self, db_session: Session, sample_inventory_data):
        """Test getting dashboard statistics."""
        repo = InventoryRepository()
        repo.create(db_session, obj_in=InventoryCreate(**sample_inventory_data))
        
        stats = repo.get_stats(db_session)
        
        assert "total_items" in stats
        assert "low_stock_items" in stats
        assert "out_of_stock_items" in stats
        assert "expiring_soon_items" in stats
        assert "expired_items" in stats
        assert stats["total_items"] >= 1
