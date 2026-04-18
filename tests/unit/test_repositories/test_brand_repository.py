"""Tests for BrandRepository."""
import pytest
from decimal import Decimal
from sqlalchemy.orm import Session

from app.repositories.brand import brand_repository
from app.repositories.generic import generic_repository
from app.repositories.manufacturer import manufacturer_repository
from app.repositories.dosage_form import dosage_form_repository
from app.schemas.brand import BrandNameCreate
from app.schemas.generic import GenericDrugCreate
from app.schemas.manufacturer import ManufacturerCreate
from app.schemas.dosage_form import DosageFormCreate


class TestBrandRepository:
    """Test suite for BrandRepository."""
    
    @pytest.fixture
    def create_dependencies(self, db_session: Session):
        """Create required foreign key dependencies."""
        # Create generic
        generic_data = {
            "generic_name": "Paracetamol",
            "cas_number": "103-90-2",
        }
        generic = generic_repository.create(
            db_session, 
            obj_in=GenericDrugCreate(**generic_data)
        )
        
        # Create manufacturer
        mfr_data = {
            "manufacturer_name": "Test Pharma",
            "country_code": "US",
        }
        manufacturer = manufacturer_repository.create(
            db_session,
            obj_in=ManufacturerCreate(**mfr_data)
        )
        
        # Create dosage form
        form_data = {
            "form_code": "TAB",
            "form_name": "Tablet",
        }
        dosage_form = dosage_form_repository.create(
            db_session,
            obj_in=DosageFormCreate(**form_data)
        )
        
        return {
            "generic_id": generic.generic_id,
            "manufacturer_id": manufacturer.manufacturer_id,
            "dosage_form_id": dosage_form.dosage_form_id,
        }
    
    @pytest.fixture
    def sample_brand_data(self, create_dependencies):
        """Sample brand data."""
        deps = create_dependencies
        return {
            "brand_name": "Tylenol",
            "generic_id": deps["generic_id"],
            "manufacturer_id": deps["manufacturer_id"],
            "dosage_form_id": deps["dosage_form_id"],
            "strength_value": Decimal("500"),
            "strength_unit": "mg",
            "ndc_number": "50580-011-00",
            "barcode": "030550550011",
        }
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_ndc(self, db_session: Session, sample_brand_data):
        """Test lookup by NDC number."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        created = brand_repository.create(db_session, obj_in=obj_in)
        
        # Get by NDC
        fetched = brand_repository.get_by_ndc(db_session, "50580-011-00")
        
        assert fetched is not None
        assert fetched.brand_id == created.brand_id
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_barcode(self, db_session: Session, sample_brand_data):
        """Test lookup by barcode."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        created = brand_repository.create(db_session, obj_in=obj_in)
        
        # Get by barcode
        fetched = brand_repository.get_by_barcode(db_session, "030550550011")
        
        assert fetched is not None
        assert fetched.brand_id == created.brand_id
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_search(self, db_session: Session, sample_brand_data):
        """Test search by name, NDC, or barcode."""
        # Create multiple brands
        brands = [
            {**sample_brand_data, "brand_name": "Tylenol", "ndc_number": "50580-011-00"},
            {**sample_brand_data, "brand_name": "Advil", "ndc_number": "0573-0160-50"},
        ]
        for brand in brands:
            brand_repository.create(db_session, obj_in=BrandNameCreate(**brand))
        
        # Search
        results = brand_repository.search(db_session, query="Tylenol")
        assert len(results) == 1
        assert results[0].brand_name == "Tylenol"
        
        # Search by NDC partial
        results = brand_repository.search(db_session, query="0573")
        assert len(results) == 1
        assert results[0].brand_name == "Advil"
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_generic(self, db_session: Session, sample_brand_data, create_dependencies):
        """Test filtering by generic drug."""
        # Create brand
        brand_repository.create(db_session, obj_in=BrandNameCreate(**sample_brand_data))
        
        # Get by generic
        results = brand_repository.get_by_generic(
            db_session, 
            generic_id=create_dependencies["generic_id"]
        )
        
        assert len(results) == 1
        assert results[0].brand_name == "Tylenol"
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_manufacturer(self, db_session: Session, sample_brand_data, create_dependencies):
        """Test filtering by manufacturer."""
        # Create brand
        brand_repository.create(db_session, obj_in=BrandNameCreate(**sample_brand_data))
        
        # Get by manufacturer
        results = brand_repository.get_by_manufacturer(
            db_session,
            manufacturer_id=create_dependencies["manufacturer_id"]
        )
        
        assert len(results) == 1
