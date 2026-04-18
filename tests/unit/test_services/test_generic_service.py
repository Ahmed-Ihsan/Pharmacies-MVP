"""Tests for GenericService."""
import pytest
from sqlalchemy.orm import Session

from app.services.generic import generic_service
from app.services.therapeutic_class import therapeutic_class_service
from app.schemas.generic import GenericDrugCreate, GenericDrugUpdate
from app.schemas.therapeutic_class import TherapeuticClassCreate
from app.core.exceptions import NotFoundException, DuplicateException


class TestGenericService:
    """Test suite for GenericService."""
    
    @pytest.fixture
    def create_therapeutic_class(self, db_session: Session):
        """Create a therapeutic class for testing."""
        data = {"class_code": "N02", "class_name": "Analgesics"}
        return therapeutic_class_service.create(
            db_session,
            obj_in=TherapeuticClassCreate(**data)
        )
    
    @pytest.fixture
    def sample_generic_data(self, create_therapeutic_class):
        """Sample generic drug data."""
        return {
            "generic_name": "Paracetamol",
            "chemical_name": "N-(4-hydroxyphenyl)acetamide",
            "cas_number": "103-90-2",
            "therapeutic_class_id": create_therapeutic_class.class_id,
            "indications": "Pain relief and fever reduction",
        }
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_success(self, db_session: Session, sample_generic_data):
        """Test getting an existing generic drug."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        created = generic_service.create(db_session, obj_in=obj_in)
        
        # Get
        fetched = generic_service.get(db_session, created.generic_id)
        
        assert fetched.generic_id == created.generic_id
        assert fetched.generic_name == sample_generic_data["generic_name"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_not_found(self, db_session: Session):
        """Test getting non-existent generic raises exception."""
        with pytest.raises(NotFoundException) as exc_info:
            generic_service.get(db_session, 99999)
        
        assert "GenericDrug" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_by_cas(self, db_session: Session, sample_generic_data):
        """Test lookup by CAS number."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        generic_service.create(db_session, obj_in=obj_in)
        
        # Get by CAS
        fetched = generic_service.get_by_cas(db_session, sample_generic_data["cas_number"])
        
        assert fetched is not None
        assert fetched.cas_number == sample_generic_data["cas_number"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_success(self, db_session: Session, sample_generic_data):
        """Test creating a new generic drug."""
        obj_in = GenericDrugCreate(**sample_generic_data)
        created = generic_service.create(db_session, obj_in=obj_in)
        
        assert created.generic_name == sample_generic_data["generic_name"]
        assert created.cas_number == sample_generic_data["cas_number"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_duplicate_cas(self, db_session: Session, sample_generic_data):
        """Test creating duplicate CAS raises exception."""
        # Create first
        obj_in = GenericDrugCreate(**sample_generic_data)
        generic_service.create(db_session, obj_in=obj_in)
        
        # Try duplicate
        duplicate_cas = {
            **sample_generic_data,
            "generic_name": "Different Name",
        }
        
        with pytest.raises(DuplicateException) as exc_info:
            generic_service.create(db_session, obj_in=GenericDrugCreate(**duplicate_cas))
        
        assert "cas_number" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_duplicate_name(self, db_session: Session, sample_generic_data):
        """Test creating duplicate name raises exception."""
        # Create first
        obj_in = GenericDrugCreate(**sample_generic_data)
        generic_service.create(db_session, obj_in=obj_in)
        
        # Try duplicate name
        duplicate_name = {
            **sample_generic_data,
            "cas_number": "99999-99-9",  # Different CAS
        }
        
        with pytest.raises(DuplicateException) as exc_info:
            generic_service.create(db_session, obj_in=GenericDrugCreate(**duplicate_name))
        
        assert "generic_name" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_update_success(self, db_session: Session, sample_generic_data):
        """Test updating a generic drug."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        created = generic_service.create(db_session, obj_in=obj_in)
        
        # Update
        update_data = GenericDrugUpdate(indications="Updated indications")
        updated = generic_service.update(db_session, generic_id=created.generic_id, obj_in=update_data)
        
        assert updated.indications == "Updated indications"
        assert updated.generic_name == sample_generic_data["generic_name"]  # Unchanged
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_update_duplicate_cas(self, db_session: Session, sample_generic_data):
        """Test updating to duplicate CAS raises exception."""
        # Create two generics
        obj1 = GenericDrugCreate(**sample_generic_data)
        created1 = generic_service.create(db_session, obj_in=obj1)
        
        obj2 = {
            **sample_generic_data,
            "generic_name": "Other Generic",
            "cas_number": "99999-99-9",
        }
        created2 = generic_service.create(db_session, obj_in=GenericDrugCreate(**obj2))
        
        # Try to update second to first's CAS
        update_data = GenericDrugUpdate(cas_number=sample_generic_data["cas_number"])
        
        with pytest.raises(DuplicateException) as exc_info:
            generic_service.update(db_session, generic_id=created2.generic_id, obj_in=update_data)
        
        assert "cas_number" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_search(self, db_session: Session):
        """Test search functionality."""
        # Create generics
        generics = [
            {"generic_name": "Paracetamol", "cas_number": "103-90-2"},
            {"generic_name": "Ibuprofen", "cas_number": "15687-27-1"},
        ]
        for gen in generics:
            generic_service.create(db_session, obj_in=GenericDrugCreate(**gen))
        
        # Search
        results = generic_service.search(db_session, query="Paracetamol")
        
        assert len(results) >= 1
        assert any(r.generic_name == "Paracetamol" for r in results)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_by_therapeutic_class(self, db_session: Session, sample_generic_data, create_therapeutic_class):
        """Test filtering by therapeutic class."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        generic_service.create(db_session, obj_in=obj_in)
        
        # Get by class
        results = generic_service.get_by_therapeutic_class(
            db_session,
            class_id=create_therapeutic_class.class_id
        )
        
        assert len(results) >= 1
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_remove_success(self, db_session: Session, sample_generic_data):
        """Test removing a generic drug."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        created = generic_service.create(db_session, obj_in=obj_in)
        generic_id = created.generic_id
        
        # Remove
        generic_service.remove(db_session, generic_id=generic_id)
        
        # Verify removal
        with pytest.raises(NotFoundException):
            generic_service.get(db_session, generic_id)
