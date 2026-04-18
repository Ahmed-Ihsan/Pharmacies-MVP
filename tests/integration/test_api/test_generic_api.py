"""Integration tests for Generic Drug API endpoints."""
import pytest
import uuid
from fastapi.testclient import TestClient


class TestGenericDrugAPI:
    """Test suite for Generic Drug API endpoints."""
    
    @pytest.fixture
    def unique_ids(self):
        """Generate unique identifiers."""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "class_code": f"CLS{unique_id}",
            "class_name": f"Class {unique_id}",
            "generic_name": f"Generic{unique_id}",
            "cas_number": f"{unique_id[:5]}-{unique_id[5:]}-9",
        }
    
    @pytest.fixture
    def create_therapeutic_class(self, client: TestClient, unique_ids):
        """Create a therapeutic class and return its ID."""
        payload = {
            "class_code": unique_ids["class_code"],
            "class_name": unique_ids["class_name"],
        }
        response = client.post("/api/v1/therapeutic-classes/", json=payload)
        return response.json()["class_id"]
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_list_generic_drugs(self, client: TestClient):
        """Test listing generic drugs."""
        response = client.get("/api/v1/generics/")
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_create_generic_drug(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test creating a generic drug."""
        payload = {
            "generic_name": unique_ids["generic_name"],
            "chemical_name": "Acetaminophen",
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
            "indications": "Pain relief and fever reduction",
        }
        
        response = client.post("/api/v1/generics/", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        generic_id = data["generic_id"]
        assert data["generic_id"] == generic_id
        assert data["generic_name"] == unique_ids["generic_name"]
        assert data["cas_number"] == unique_ids["cas_number"]
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_get_generic_drug(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test getting a specific generic drug."""
        # Create first
        payload = {
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
        }
        create_response = client.post("/api/v1/generics/", json=payload)
        generic_id = create_response.json()["generic_id"]
        
        # Get
        response = client.get(f"/api/v1/generics/{generic_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["generic_id"] == generic_id
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_search_generic_drugs(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test searching generic drugs."""
        # Create
        client.post("/api/v1/generics/", json={
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
        })
        
        # Search
        response = client.get(f"/api/v1/generics/?search={unique_ids['generic_name']}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_update_generic_drug(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test updating a generic drug."""
        # Create first
        payload = {
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
        }
        create_response = client.post("/api/v1/generics/", json=payload)
        generic_id = create_response.json()["generic_id"]
        
        # Update
        update_payload = {"indications": "Updated indications"}
        response = client.put(f"/api/v1/generics/{generic_id}", json=update_payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["indications"] == "Updated indications"
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_delete_generic_drug(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test deleting a generic drug."""
        # Create first
        payload = {
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
        }
        create_response = client.post("/api/v1/generics/", json=payload)
        generic_id = create_response.json()["generic_id"]
        
        # Delete
        response = client.delete(f"/api/v1/generics/{generic_id}")
        
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()
        
        # Verify
        get_response = client.get(f"/api/v1/generics/{generic_id}")
        assert get_response.status_code == 404
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_create_duplicate_cas(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test creating duplicate CAS number returns 409."""
        payload = {
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
        }
        
        # Create first
        client.post("/api/v1/generics/", json=payload)
        
        # Try duplicate
        response = client.post("/api/v1/generics/", json=payload)
        
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"].lower()
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_get_alternatives(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test getting alternatives for a generic drug."""
        # Create generic
        payload = {
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
        }
        create_response = client.post("/api/v1/generics/", json=payload)
        generic_id = create_response.json()["generic_id"]
        
        # Get alternatives (may be empty)
        response = client.get(f"/api/v1/generics/{generic_id}/alternatives")
        
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_filter_by_therapeutic_class(self, client: TestClient, create_therapeutic_class, unique_ids):
        """Test filtering generics by therapeutic class."""
        # Create generic
        payload = {
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
            "therapeutic_class_id": create_therapeutic_class,
        }
        client.post("/api/v1/generics/", json=payload)
        
        # Filter by class
        response = client.get(f"/api/v1/generics/?therapeutic_class_id={create_therapeutic_class}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
