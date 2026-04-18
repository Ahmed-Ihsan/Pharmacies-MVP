"""Tests for TherapeuticClassService."""
import pytest
from sqlalchemy.orm import Session

from app.services.therapeutic_class import therapeutic_class_service
from app.schemas.therapeutic_class import TherapeuticClassCreate, TherapeuticClassUpdate
from app.core.exceptions import NotFoundException, DuplicateException


class TestTherapeuticClassService:
    """Test suite for TherapeuticClassService."""
    
    @pytest.fixture
    def sample_data(self):
        """Sample therapeutic class data."""
        return {
            "class_code": "N02",
            "class_name": "Analgesics",
            "description": "Pain relief medications",
        }
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_success(self, db_session: Session, sample_data):
        """Test getting an existing class."""
        # Create
        obj_in = TherapeuticClassCreate(**sample_data)
        created = therapeutic_class_service.create(db_session, obj_in=obj_in)
        
        # Get
        fetched = therapeutic_class_service.get(db_session, created.class_id)
        
        assert fetched.class_id == created.class_id
        assert fetched.class_name == sample_data["class_name"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_not_found(self, db_session: Session):
        """Test getting non-existent class raises exception."""
        with pytest.raises(NotFoundException) as exc_info:
            therapeutic_class_service.get(db_session, 99999)
        
        assert "TherapeuticClass" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_success(self, db_session: Session, sample_data):
        """Test creating a new class."""
        obj_in = TherapeuticClassCreate(**sample_data)
        created = therapeutic_class_service.create(db_session, obj_in=obj_in)
        
        assert created.class_code == sample_data["class_code"]
        assert created.class_name == sample_data["class_name"]
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_duplicate_code(self, db_session: Session, sample_data):
        """Test creating duplicate class code raises exception."""
        # Create first
        obj_in = TherapeuticClassCreate(**sample_data)
        therapeutic_class_service.create(db_session, obj_in=obj_in)
        
        # Try duplicate
        with pytest.raises(DuplicateException) as exc_info:
            therapeutic_class_service.create(db_session, obj_in=obj_in)
        
        assert "class_code" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_create_duplicate_name(self, db_session: Session, sample_data):
        """Test creating duplicate class name raises exception."""
        # Create first
        obj_in = TherapeuticClassCreate(**sample_data)
        therapeutic_class_service.create(db_session, obj_in=obj_in)
        
        # Try duplicate name with different code
        duplicate_name = {
            "class_code": "DIFFERENT",
            "class_name": sample_data["class_name"],  # Same name
        }
        
        with pytest.raises(DuplicateException) as exc_info:
            therapeutic_class_service.create(db_session, obj_in=TherapeuticClassCreate(**duplicate_name))
        
        assert "class_name" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_update_success(self, db_session: Session, sample_data):
        """Test updating a class."""
        # Create
        obj_in = TherapeuticClassCreate(**sample_data)
        created = therapeutic_class_service.create(db_session, obj_in=obj_in)
        
        # Update
        update_data = TherapeuticClassUpdate(class_name="Updated Name")
        updated = therapeutic_class_service.update(db_session, class_id=created.class_id, obj_in=update_data)
        
        assert updated.class_name == "Updated Name"
        assert updated.class_code == sample_data["class_code"]  # Unchanged
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_update_duplicate_code(self, db_session: Session, sample_data):
        """Test updating to duplicate code raises exception."""
        # Create two classes
        obj1 = TherapeuticClassCreate(**sample_data)
        created1 = therapeutic_class_service.create(db_session, obj_in=obj1)
        
        obj2 = TherapeuticClassCreate(class_code="OTHER", class_name="Other Class")
        created2 = therapeutic_class_service.create(db_session, obj_in=obj2)
        
        # Try to update second to first's code
        update_data = TherapeuticClassUpdate(class_code=sample_data["class_code"])
        
        with pytest.raises(DuplicateException) as exc_info:
            therapeutic_class_service.update(db_session, class_id=created2.class_id, obj_in=update_data)
        
        assert "class_code" in str(exc_info.value)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_remove_success(self, db_session: Session, sample_data):
        """Test removing a class."""
        # Create
        obj_in = TherapeuticClassCreate(**sample_data)
        created = therapeutic_class_service.create(db_session, obj_in=obj_in)
        class_id = created.class_id
        
        # Remove
        therapeutic_class_service.remove(db_session, class_id=class_id)
        
        # Verify removal
        with pytest.raises(NotFoundException):
            therapeutic_class_service.get(db_session, class_id)
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_search(self, db_session: Session):
        """Test search functionality."""
        # Create classes
        classes = [
            {"class_code": "N02", "class_name": "Analgesics"},
            {"class_code": "J01", "class_name": "Antibiotics"},
        ]
        for cls in classes:
            therapeutic_class_service.create(db_session, obj_in=TherapeuticClassCreate(**cls))
        
        # Search
        results = therapeutic_class_service.search(db_session, query="Anti")
        
        assert len(results) >= 1
    
    @pytest.mark.service
    @pytest.mark.unit
    def test_get_roots(self, db_session: Session):
        """Test getting root classes."""
        # Create root
        root = TherapeuticClassCreate(class_code="ROOT", class_name="Root Class")
        therapeutic_class_service.create(db_session, obj_in=root)
        
        # Get roots
        roots = therapeutic_class_service.get_roots(db_session)
        
        assert len(roots) >= 1
