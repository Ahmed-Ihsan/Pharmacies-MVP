"""Tests for BrandService."""
import pytest
from decimal import Decimal
from sqlalchemy.orm import Session

from app.services.brand import brand_service
from app.services.generic import generic_service
from app.services.manufacturer import manufacturer_service
from app.services.dosage_form import dosage_form_service
from app.schemas.brand import BrandNameCreate, BrandNameUpdate
from app.schemas.generic import GenericDrugCreate
from app.schemas.manufacturer import ManufacturerCreate
from app.schemas.dosage_form import DosageFormCreate
from app.core.exceptions import NotFoundException, DuplicateException


class TestBrandService:
    """Test suite for BrandService."""
    
    @pytest.fixture
    def create_dependencies(self, db_session: Session):
        """Create required dependencies."""
        # Create generic
        generic = generic_service.create(
            db_session,
            obj_in=GenericDrugCreate(generic_name="Paracetamol", cas_number="103-90-2")
        )
        
        # Create manufacturer
        manufacturer = manufacturer_service.create(
            db_session,
            obj_in=ManufacturerCreate(manufacturer_name="Test Pharma", country_code="US")
        )
        
        # Create dosage form
        dosage_form = dosage_form_service.create(
            db_session,
            obj_in=DosageFormCreate(form_code="TAB", form_name="Tablet")
        )
        
        return {
            "generic_id": generic.generic_id,
            "manufacturer_id": manufacturer.manufacturer_id,
            "dosage_form_id": dosage_form.dosage_form_id,
        }
    
    @pytest.fixture
    def sample_brand_data(self, create_dependencies):
        """Sample brand data."""
        return {
            "brand_name": "Tylenol",
            "generic_id": create_dependencies["generic_id"],
            "manufacturer_id": create_dependencies["manufacturer_id"],
            "dosage_form_id": create_dependencies["dosage_form_id"],
            "strength_value": Decimal("500"),
            "strength_unit": "mg",
            "ndc_number": "50580-011-00",
            "barcode": "030550550011",
        }
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_success(self, db_session: Session, sample_brand_data):
        """Test getting an existing brand."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        created = brand_service.create(db_session, obj_in=obj_in)
        
        # Get
        fetched = brand_service.get(db_session, created.brand_id)
        
        assert fetched.brand_id == created.brand_id
        assert fetched.brand_name == sample_brand_data["brand_name"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_not_found(self, db_session: Session):
        """Test getting non-existent brand raises exception."""
        with pytest.raises(NotFoundException) as exc_info:
            brand_service.get(db_session, 99999)
        
        assert "BrandName" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_by_ndc(self, db_session: Session, sample_brand_data):
        """Test lookup by NDC number."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        brand_service.create(db_session, obj_in=obj_in)
        
        # Get by NDC
        fetched = brand_service.get_by_ndc(db_session, sample_brand_data["ndc_number"])
        
        assert fetched is not None
        assert fetched.ndc_number == sample_brand_data["ndc_number"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_by_barcode(self, db_session: Session, sample_brand_data):
        """Test lookup by barcode."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        brand_service.create(db_session, obj_in=obj_in)
        
        # Get by barcode
        fetched = brand_service.get_by_barcode(db_session, sample_brand_data["barcode"])
        
        assert fetched is not None
        assert fetched.barcode == sample_brand_data["barcode"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_success(self, db_session: Session, sample_brand_data):
        """Test creating a new brand."""
        obj_in = BrandNameCreate(**sample_brand_data)
        created = brand_service.create(db_session, obj_in=obj_in)
        
        assert created.brand_name == sample_brand_data["brand_name"]
        assert created.ndc_number == sample_brand_data["ndc_number"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_duplicate_ndc(self, db_session: Session, sample_brand_data):
        """Test creating duplicate NDC raises exception."""
        # Create first
        obj_in = BrandNameCreate(**sample_brand_data)
        brand_service.create(db_session, obj_in=obj_in)
        
        # Try duplicate
        duplicate_ndc = {
            **sample_brand_data,
            "brand_name": "Different Brand",
        }
        
        with pytest.raises(DuplicateException) as exc_info:
            brand_service.create(db_session, obj_in=BrandNameCreate(**duplicate_ndc))
        
        assert "ndc_number" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_duplicate_barcode(self, db_session: Session, sample_brand_data):
        """Test creating duplicate barcode raises exception."""
        # Create first
        obj_in = BrandNameCreate(**sample_brand_data)
        brand_service.create(db_session, obj_in=obj_in)
        
        # Try duplicate
        duplicate_barcode = {
            **sample_brand_data,
            "brand_name": "Different Brand",
            "ndc_number": "DIFFERENT-123",
        }
        
        with pytest.raises(DuplicateException) as exc_info:
            brand_service.create(db_session, obj_in=BrandNameCreate(**duplicate_barcode))
        
        assert "barcode" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_update_success(self, db_session: Session, sample_brand_data):
        """Test updating a brand."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        created = brand_service.create(db_session, obj_in=obj_in)
        
        # Update
        update_data = BrandNameUpdate(package_size="Updated Package")
        updated = brand_service.update(db_session, brand_id=created.brand_id, obj_in=update_data)
        
        assert updated.package_size == "Updated Package"
        assert updated.brand_name == sample_brand_data["brand_name"]  # Unchanged
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_search(self, db_session: Session, sample_brand_data):
        """Test search functionality."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        brand_service.create(db_session, obj_in=obj_in)
        
        # Search
        results = brand_service.search(db_session, query="Tylenol")
        
        assert len(results) >= 1
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_by_generic(self, db_session: Session, sample_brand_data, create_dependencies):
        """Test filtering by generic drug."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        brand_service.create(db_session, obj_in=obj_in)
        
        # Get by generic
        results = brand_service.get_by_generic(
            db_session,
            generic_id=create_dependencies["generic_id"]
        )
        
        assert len(results) >= 1
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_remove_success(self, db_session: Session, sample_brand_data):
        """Test removing a brand."""
        # Create
        obj_in = BrandNameCreate(**sample_brand_data)
        created = brand_service.create(db_session, obj_in=obj_in)
        brand_id = created.brand_id
        
        # Remove
        brand_service.remove(db_session, brand_id=brand_id)
        
        # Verify removal
        with pytest.raises(NotFoundException):
            brand_service.get(db_session, brand_id)
