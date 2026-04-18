"""Integration tests for Therapeutic Class API endpoints."""
import pytest
import uuid
from fastapi.testclient import TestClient


class TestTherapeuticClassAPI:
    """Test suite for Therapeutic Class API endpoints."""
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_list_therapeutic_classes(self, client: TestClient):
        """Test listing therapeutic classes."""
        response = client.get("/api/v1/therapeutic-classes/")
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
    
    @pytest.fixture
    def unique_class_data(self):
        """Generate unique therapeutic class data."""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "class_code": f"TEST{unique_id}",
            "class_name": f"Test Class {unique_id}",
            "description": "Test description",
        }
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_create_therapeutic_class(self, client: TestClient, unique_class_data):
        """Test creating a therapeutic class."""
        payload = unique_class_data
        
        response = client.post("/api/v1/therapeutic-classes/", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["class_code"] == payload["class_code"]
        assert data["class_name"] == payload["class_name"]
        assert "class_id" in data
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_get_therapeutic_class(self, client: TestClient, unique_class_data):
        """Test getting a specific therapeutic class."""
        # Create first
        create_response = client.post("/api/v1/therapeutic-classes/", json=unique_class_data)
        class_id = create_response.json()["class_id"]
        
        # Get
        response = client.get(f"/api/v1/therapeutic-classes/{class_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["class_id"] == class_id
        assert data["class_name"] == unique_class_data["class_name"]
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_get_nonexistent_class(self, client: TestClient):
        """Test getting a non-existent class returns 404."""
        response = client.get("/api/v1/therapeutic-classes/99999")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_update_therapeutic_class(self, client: TestClient, unique_class_data):
        """Test updating a therapeutic class."""
        # Create first
        create_response = client.post("/api/v1/therapeutic-classes/", json=unique_class_data)
        class_id = create_response.json()["class_id"]
        
        # Update
        update_payload = {"class_name": f"Updated {unique_class_data['class_name']}"}
        response = client.put(f"/api/v1/therapeutic-classes/{class_id}", json=update_payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["class_name"] == f"Updated {unique_class_data['class_name']}"
        assert data["class_code"] == unique_class_data["class_code"]  # Unchanged
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_delete_therapeutic_class(self, client: TestClient, unique_class_data):
        """Test deleting a therapeutic class."""
        # Create first
        create_response = client.post("/api/v1/therapeutic-classes/", json=unique_class_data)
        class_id = create_response.json()["class_id"]
        
        # Delete
        response = client.delete(f"/api/v1/therapeutic-classes/{class_id}")
        
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()
        
        # Verify deletion
        get_response = client.get(f"/api/v1/therapeutic-classes/{class_id}")
        assert get_response.status_code == 404
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_search_therapeutic_classes(self, client: TestClient, unique_class_data):
        """Test searching therapeutic classes."""
        # Create class with unique searchable name
        search_data = {
            "class_code": f"SEARCH{unique_class_data['class_code']}",
            "class_name": f"SearchableClass {unique_class_data['class_name']}",
        }
        client.post("/api/v1/therapeutic-classes/", json=search_data)
        
        # Search
        response = client.get(f"/api/v1/therapeutic-classes/?search=Searchable")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_create_duplicate_code(self, client: TestClient, unique_class_data):
        """Test creating duplicate class code returns 409."""
        # Create first
        client.post("/api/v1/therapeutic-classes/", json=unique_class_data)
        
        # Try duplicate
        response = client.post("/api/v1/therapeutic-classes/", json=unique_class_data)
        
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"].lower()
