"""Tests for TherapeuticClassRepository."""
import pytest
from sqlalchemy.orm import Session

from app.repositories.therapeutic_class import therapeutic_class_repository
from app.schemas.therapeutic_class import TherapeuticClassCreate


class TestTherapeuticClassRepository:
    """Test suite for TherapeuticClassRepository."""
    
    @pytest.fixture
    def sample_data(self):
        """Sample therapeutic class data."""
        return {
            "class_code": "N02",
            "class_name": "Analgesics",
            "description": "Pain relief medications",
        }
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_code(self, db_session: Session, sample_data):
        """Test lookup by class code."""
        # Create
        obj_in = TherapeuticClassCreate(**sample_data)
        created = therapeutic_class_repository.create(db_session, obj_in=obj_in)
        
        # Get by code
        fetched = therapeutic_class_repository.get_by_code(db_session, "N02")
        
        assert fetched is not None
        assert fetched.class_id == created.class_id
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_name(self, db_session: Session, sample_data):
        """Test lookup by class name."""
        # Create
        obj_in = TherapeuticClassCreate(**sample_data)
        created = therapeutic_class_repository.create(db_session, obj_in=obj_in)
        
        # Get by name
        fetched = therapeutic_class_repository.get_by_name(db_session, "Analgesics")
        
        assert fetched is not None
        assert fetched.class_id == created.class_id
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_search(self, db_session: Session):
        """Test search functionality."""
        # Create multiple
        classes = [
            {"class_code": "N02", "class_name": "Analgesics"},
            {"class_code": "N03", "class_name": "Antiepileptics"},
            {"class_code": "J01", "class_name": "Antibiotics"},
        ]
        for cls in classes:
            therapeutic_class_repository.create(
                db_session, 
                obj_in=TherapeuticClassCreate(**cls)
            )
        
        # Search
        results = therapeutic_class_repository.search(db_session, query="Anti")
        
        assert len(results) == 2  # Antiepileptics and Antibiotics
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_roots(self, db_session: Session):
        """Test getting root classes (no parent)."""
        # Create root
        root = TherapeuticClassCreate(class_code="N", class_name="Nervous System")
        root_obj = therapeutic_class_repository.create(db_session, obj_in=root)
        
        # Create child
        child = TherapeuticClassCreate(
            class_code="N02", 
            class_name="Analgesics",
            parent_class_id=root_obj.class_id
        )
        therapeutic_class_repository.create(db_session, obj_in=child)
        
        # Get roots
        roots = therapeutic_class_repository.get_roots(db_session)
        
        assert len(roots) == 1
        assert roots[0].class_code == "N"
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_children(self, db_session: Session):
        """Test getting child classes."""
        # Create parent
        parent = TherapeuticClassCreate(class_code="N", class_name="Nervous System")
        parent_obj = therapeutic_class_repository.create(db_session, obj_in=parent)
        
        # Create children
        for i in range(3):
            child = TherapeuticClassCreate(
                class_code=f"N0{i+1}",
                class_name=f"Child {i+1}",
                parent_class_id=parent_obj.class_id
            )
            therapeutic_class_repository.create(db_session, obj_in=child)
        
        # Get children
        children = therapeutic_class_repository.get_children(db_session, parent_obj.class_id)
        
        assert len(children) == 3
