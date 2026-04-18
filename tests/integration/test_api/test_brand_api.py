"""Integration tests for Brand API endpoints."""
import pytest
import uuid
from fastapi.testclient import TestClient


class TestBrandAPI:
    """Test suite for Brand API endpoints."""
    
    @pytest.fixture
    def unique_ids(self):
        """Generate unique identifiers."""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "generic_name": f"Generic{unique_id}",
            "cas_number": f"{unique_id[:5]}-{unique_id[5:]}-9",
            "mfr_name": f"Mfr{unique_id}",
            "form_code": f"FRM{unique_id[:4]}",
            "form_name": f"Form{unique_id}",
            "brand_name": f"Brand{unique_id}",
            "ndc": f"{unique_id[:5]}-{unique_id[3:6]}-{unique_id[6:8]}",
            "barcode": f"BC{unique_id}",
        }
    
    @pytest.fixture
    def create_dependencies(self, client: TestClient, unique_ids):
        """Create required dependencies (generic, manufacturer, dosage form)."""
        # Create generic
        generic_payload = {
            "generic_name": unique_ids["generic_name"],
            "cas_number": unique_ids["cas_number"],
        }
        generic_response = client.post("/api/v1/generics/", json=generic_payload)
        generic_id = generic_response.json()["generic_id"]
        
        # Create manufacturer
        mfr_payload = {
            "manufacturer_name": unique_ids["mfr_name"],
            "country_code": "US",
        }
        mfr_response = client.post("/api/v1/manufacturers/", json=mfr_payload)
        manufacturer_id = mfr_response.json()["manufacturer_id"]
        
        # Create dosage form
        form_payload = {
            "form_code": unique_ids["form_code"],
            "form_name": unique_ids["form_name"],
        }
        form_response = client.post("/api/v1/dosage-forms/", json=form_payload)
        assert form_response.status_code == 201, f"Dosage form creation failed: {form_response.text}"
        dosage_form_id = form_response.json()["dosage_form_id"]
        
        return {
            "generic_id": generic_id,
            "manufacturer_id": manufacturer_id,
            "dosage_form_id": dosage_form_id,
            "unique_ids": unique_ids,
        }
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_list_brands(self, client: TestClient):
        """Test listing brand names."""
        response = client.get("/api/v1/brands/")
        
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_create_brand(self, client: TestClient, create_dependencies):
        """Test creating a brand name."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        payload = {
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "strength_value": 500,
            "strength_unit": "mg",
            "package_size": "100 tablets",
            "ndc_number": unique_ids["ndc"],
            "barcode": unique_ids["barcode"],
        }
        
        response = client.post("/api/v1/brands/", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["brand_name"] == unique_ids["brand_name"]
        assert data["ndc_number"] == unique_ids["ndc"]
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_get_brand_by_ndc(self, client: TestClient, create_dependencies):
        """Test looking up brand by NDC number."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        payload = {
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "ndc_number": unique_ids["ndc"],
            "barcode": unique_ids["barcode"],
        }
        client.post("/api/v1/brands/", json=payload)
        
        # Get by NDC
        response = client.get(f"/api/v1/brands/by-ndc/{unique_ids['ndc']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["brand_name"] == unique_ids["brand_name"]
        assert data["ndc_number"] == unique_ids["ndc"]
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_get_brand_by_barcode(self, client: TestClient, create_dependencies):
        """Test looking up brand by barcode."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        payload = {
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "ndc_number": unique_ids["ndc"],
            "barcode": unique_ids["barcode"],
        }
        client.post("/api/v1/brands/", json=payload)
        
        # Get by barcode
        response = client.get(f"/api/v1/brands/by-barcode/{unique_ids['barcode']}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["barcode"] == unique_ids["barcode"]
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_search_brands(self, client: TestClient, create_dependencies):
        """Test searching brand names."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        # Create brand
        client.post("/api/v1/brands/", json={
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "ndc_number": unique_ids["ndc"],
        })
        
        # Search
        response = client.get(f"/api/v1/brands/?search={unique_ids['brand_name']}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_filter_by_generic(self, client: TestClient, create_dependencies):
        """Test filtering brands by generic drug."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        # Create brand
        client.post("/api/v1/brands/", json={
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "ndc_number": unique_ids["ndc"],
            "barcode": unique_ids["barcode"],
        })
        
        # Filter by generic
        response = client.get(f"/api/v1/brands/?generic_id={deps['generic_id']}")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_update_brand(self, client: TestClient, create_dependencies):
        """Test updating a brand."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        # Create
        payload = {
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "ndc_number": unique_ids["ndc"],
        }
        create_response = client.post("/api/v1/brands/", json=payload)
        brand_id = create_response.json()["brand_id"]
        
        # Update
        update_payload = {"package_size": "Updated Package Size"}
        response = client.put(f"/api/v1/brands/{brand_id}", json=update_payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["package_size"] == "Updated Package Size"
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_delete_brand(self, client: TestClient, create_dependencies):
        """Test deleting a brand."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        # Create
        payload = {
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "ndc_number": unique_ids["ndc"],
        }
        create_response = client.post("/api/v1/brands/", json=payload)
        brand_id = create_response.json()["brand_id"]
        
        # Delete
        response = client.delete(f"/api/v1/brands/{brand_id}")
        
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()
        
        # Verify
        get_response = client.get(f"/api/v1/brands/{brand_id}")
        assert get_response.status_code == 404
    
    @pytest.mark.api
    @pytest.mark.integration
    def test_create_duplicate_ndc(self, client: TestClient, create_dependencies):
        """Test creating duplicate NDC returns 409."""
        deps = create_dependencies
        unique_ids = deps["unique_ids"]
        payload = {
            "brand_name": unique_ids["brand_name"],
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "ndc_number": unique_ids["ndc"],
        }
        
        # Create first
        client.post("/api/v1/brands/", json=payload)
        
        # Try duplicate
        duplicate_payload = {
            **payload,
            "brand_name": "Different Brand",
        }
        response = client.post("/api/v1/brands/", json=duplicate_payload)
        
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"].lower()
