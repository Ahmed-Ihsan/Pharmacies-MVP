"""Tests for GenericRepository."""
import pytest
from sqlalchemy.orm import Session

from app.repositories.generic import generic_repository
from app.repositories.therapeutic_class import therapeutic_class_repository
from app.schemas.generic import GenericDrugCreate
from app.schemas.therapeutic_class import TherapeuticClassCreate


class TestGenericRepository:
    """Test suite for GenericRepository."""
    
    @pytest.fixture
    def create_therapeutic_class(self, db_session: Session):
        """Helper to create a therapeutic class."""
        data = {"class_code": "N02", "class_name": "Analgesics"}
        return therapeutic_class_repository.create(
            db_session, 
            obj_in=TherapeuticClassCreate(**data)
        )
    
    @pytest.fixture
    def sample_generic_data(self, create_therapeutic_class):
        """Sample generic drug data with therapeutic class."""
        return {
            "generic_name": "Paracetamol",
            "chemical_name": "N-(4-hydroxyphenyl)acetamide",
            "cas_number": "103-90-2",
            "therapeutic_class_id": create_therapeutic_class.class_id,
            "indications": "Pain relief and fever reduction",
        }
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_cas_number(self, db_session: Session, sample_generic_data):
        """Test lookup by CAS number."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        created = generic_repository.create(db_session, obj_in=obj_in)
        
        # Get by CAS
        fetched = generic_repository.get_by_cas_number(db_session, "103-90-2")
        
        assert fetched is not None
        assert fetched.generic_id == created.generic_id
        assert fetched.cas_number == "103-90-2"
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_name(self, db_session: Session, sample_generic_data):
        """Test lookup by generic name."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        created = generic_repository.create(db_session, obj_in=obj_in)
        
        # Get by name
        fetched = generic_repository.get_by_name(db_session, "Paracetamol")
        
        assert fetched is not None
        assert fetched.generic_id == created.generic_id
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_search(self, db_session: Session, sample_generic_data):
        """Test search by name, chemical name, or CAS."""
        # Create multiple
        generics = [
            {
                "generic_name": "Paracetamol",
                "chemical_name": "Acetaminophen derivative",
                "cas_number": "103-90-2",
            },
            {
                "generic_name": "Ibuprofen",
                "chemical_name": "2-(4-isobutylphenyl)propionic acid",
                "cas_number": "15687-27-1",
            },
            {
                "generic_name": "Aspirin",
                "chemical_name": "Acetylsalicylic acid",
                "cas_number": "50-78-2",
            },
        ]
        for gen in generics:
            generic_repository.create(db_session, obj_in=GenericDrugCreate(**gen))
        
        # Search by name
        results = generic_repository.search(db_session, query="Paraceta")
        assert len(results) == 1
        assert results[0].generic_name == "Paracetamol"
        
        # Search by CAS
        results = generic_repository.search(db_session, query="50-78")
        assert len(results) == 1
        assert results[0].generic_name == "Aspirin"
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_by_therapeutic_class(
        self, db_session: Session, sample_generic_data, create_therapeutic_class
    ):
        """Test filtering by therapeutic class."""
        # Create
        obj_in = GenericDrugCreate(**sample_generic_data)
        generic_repository.create(db_session, obj_in=obj_in)
        
        # Get by class
        results = generic_repository.get_by_therapeutic_class(
            db_session, 
            class_id=create_therapeutic_class.class_id
        )
        
        assert len(results) == 1
        assert results[0].generic_name == "Paracetamol"
