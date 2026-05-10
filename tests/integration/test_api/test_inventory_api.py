"""Integration tests for Inventory API endpoints."""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from app.core.constants import InventoryStatus


class TestInventoryAPI:
    """Test suite for Inventory API endpoints."""
    
    @pytest.fixture
    def create_dependencies(self, client: TestClient):
        """Create required dependencies (generic, brand)."""
        # Create generic
        generic_response = client.post(
            "/api/v1/generics/",
            json={
                "generic_name": "Paracetamol",
                "chemical_name": "N-(4-hydroxyphenyl)acetamide",
                "cas_number": "103-90-2",
            }
        )
        generic_id = generic_response.json()["generic_id"]
        
        # Create brand
        brand_response = client.post(
            "/api/v1/brands/",
            json={
                "brand_name": "Tylenol",
                "generic_id": generic_id,
                "strength_value": 500,
                "strength_unit": "mg",
                "ndc_number": "50580-011-00",
                "barcode": "030550550011",
            }
        )
        brand_id = brand_response.json()["brand_id"]
        
        return {"brand_id": brand_id, "generic_id": generic_id}
    
    @pytest.fixture
    def sample_inventory_data(self, create_dependencies):
        """Sample inventory data."""
        return {
            "brand_id": create_dependencies["brand_id"],
            "current_quantity": 100,
            "minimum_quantity": 10,
            "maximum_quantity": 1000,
            "reorder_quantity": 50,
            "batch_number": "B001",
            "expiry_date": (datetime.now() + timedelta(days=365)).isoformat(),
            "location": "A1",
            "status": "available",
        }
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_create_inventory(self, client: TestClient, sample_inventory_data):
        """Test creating inventory via API."""
        response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["inventory_id"] is not None
        assert data["brand_id"] == sample_inventory_data["brand_id"]
        assert data["current_quantity"] == 100
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_get_inventory_list(self, client: TestClient, sample_inventory_data):
        """Test getting inventory list via API."""
        # Create inventory first
        client.post("/api/v1/inventory/", json=sample_inventory_data)
        
        response = client.get("/api/v1/inventory/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["brand_name"] == "Tylenol"
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_get_inventory_by_id(self, client: TestClient, sample_inventory_data):
        """Test getting inventory by ID via API."""
        # Create inventory first
        create_response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        inventory_id = create_response.json()["inventory_id"]
        
        response = client.get(f"/api/v1/inventory/{inventory_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["inventory_id"] == inventory_id
        assert data["current_quantity"] == 100
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_get_inventory_by_brand(self, client: TestClient, sample_inventory_data, create_dependencies):
        """Test getting inventory by brand ID via API."""
        # Create inventory first
        client.post("/api/v1/inventory/", json=sample_inventory_data)
        
        response = client.get(f"/api/v1/inventory/brand/{create_dependencies['brand_id']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data is not None
        assert data["brand_id"] == create_dependencies["brand_id"]
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_update_inventory(self, client: TestClient, sample_inventory_data):
        """Test updating inventory via API."""
        # Create inventory first
        create_response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        inventory_id = create_response.json()["inventory_id"]
        
        # Update
        update_data = {"current_quantity": 200}
        response = client.put(f"/api/v1/inventory/{inventory_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_quantity"] == 200
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_delete_inventory(self, client: TestClient, sample_inventory_data):
        """Test deleting inventory via API."""
        # Create inventory first
        create_response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        inventory_id = create_response.json()["inventory_id"]
        
        # Delete
        response = client.delete(f"/api/v1/inventory/{inventory_id}")
        
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_add_stock(self, client: TestClient, sample_inventory_data):
        """Test adding stock via API."""
        # Create inventory first
        create_response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        inventory_id = create_response.json()["inventory_id"]
        
        # Add stock
        response = client.post(
            f"/api/v1/inventory/{inventory_id}/add-stock",
            params={"quantity": 50}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_quantity"] == 150
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_remove_stock(self, client: TestClient, sample_inventory_data):
        """Test removing stock via API."""
        # Create inventory first
        create_response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        inventory_id = create_response.json()["inventory_id"]
        
        # Remove stock
        response = client.post(
            f"/api/v1/inventory/{inventory_id}/remove-stock",
            params={"quantity": 30}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_quantity"] == 70
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_record_sale(self, client: TestClient, sample_inventory_data, create_dependencies):
        """Test recording a sale via API."""
        # Create inventory first
        client.post("/api/v1/inventory/", json=sample_inventory_data)
        
        # Record sale
        response = client.post(
            f"/api/v1/inventory/brand/{create_dependencies['brand_id']}/sale",
            params={"quantity": 10, "sale_id": 1}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_quantity"] == 90
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_record_damage(self, client: TestClient, sample_inventory_data):
        """Test recording damaged stock via API."""
        # Create inventory first
        create_response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        inventory_id = create_response.json()["inventory_id"]
        
        # Record damage
        response = client.post(
            f"/api/v1/inventory/{inventory_id}/damage",
            params={"quantity": 5}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_quantity"] == 95
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_get_dashboard_stats(self, client: TestClient, sample_inventory_data):
        """Test getting dashboard stats via API."""
        # Create inventory first
        client.post("/api/v1/inventory/", json=sample_inventory_data)
        
        response = client.get("/api/v1/inventory/stats/dashboard")
        
        assert response.status_code == 200
        data = response.json()
        assert "total_items" in data
        assert "low_stock_items" in data
        assert data["total_items"] >= 1
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_get_movement_history(self, client: TestClient, sample_inventory_data):
        """Test getting movement history via API."""
        # Create inventory first
        create_response = client.post("/api/v1/inventory/", json=sample_inventory_data)
        inventory_id = create_response.json()["inventory_id"]
        
        # Add some movements
        client.post(f"/api/v1/inventory/{inventory_id}/add-stock", params={"quantity": 50})
        client.post(f"/api/v1/inventory/{inventory_id}/remove-stock", params={"quantity": 10})
        
        # Get history
        response = client.get(f"/api/v1/inventory/{inventory_id}/movements")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_get_active_alerts(self, client: TestClient, sample_inventory_data):
        """Test getting active alerts via API."""
        # Create inventory with low stock
        low_stock_data = {**sample_inventory_data, "current_quantity": 5, "minimum_quantity": 10}
        client.post("/api/v1/inventory/", json=low_stock_data)
        
        response = client.get("/api/v1/inventory/alerts/active")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_get_inventory_not_found(self, client: TestClient):
        """Test getting non-existent inventory."""
        response = client.get("/api/v1/inventory/99999")
        
        assert response.status_code == 404
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_update_inventory_not_found(self, client: TestClient):
        """Test updating non-existent inventory."""
        response = client.put(
            "/api/v1/inventory/99999",
            json={"current_quantity": 200}
        )
        
        assert response.status_code == 404
    
    @pytest.mark.integration
    @pytest.mark.api
    def test_delete_inventory_not_found(self, client: TestClient):
        """Test deleting non-existent inventory."""
        response = client.delete("/api/v1/inventory/99999")
        
        assert response.status_code == 404
