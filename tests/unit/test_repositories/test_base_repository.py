"""Tests for base repository."""
import pytest
from sqlalchemy.orm import Session

from app.repositories.base import BaseRepository
from app.models.therapeutic_class import TherapeuticClass
from app.schemas.therapeutic_class import TherapeuticClassCreate, TherapeuticClassUpdate


class TestBaseRepository:
    """Test suite for BaseRepository."""
    
    @pytest.fixture
    def repo(self):
        """Create a repository instance."""
        return BaseRepository(TherapeuticClass)
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_create(self, db_session: Session, repo, sample_therapeutic_class_data):
        """Test creating an object."""
        obj_in = TherapeuticClassCreate(**sample_therapeutic_class_data)
        obj = repo.create(db_session, obj_in=obj_in)
        
        assert obj.class_code == sample_therapeutic_class_data["class_code"]
        assert obj.class_name == sample_therapeutic_class_data["class_name"]
        assert obj.class_id is not None
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get(self, db_session: Session, repo, sample_therapeutic_class_data):
        """Test getting an object by ID."""
        # Create first
        obj_in = TherapeuticClassCreate(**sample_therapeutic_class_data)
        created = repo.create(db_session, obj_in=obj_in)
        
        # Get
        fetched = repo.get(db_session, created.class_id)
        
        assert fetched is not None
        assert fetched.class_id == created.class_id
        assert fetched.class_name == created.class_name
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_nonexistent(self, db_session: Session, repo):
        """Test getting a non-existent object returns None."""
        result = repo.get(db_session, 99999)
        assert result is None
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_multi(self, db_session: Session, repo):
        """Test getting multiple objects."""
        # Create multiple
        for i in range(5):
            data = {
                "class_code": f"TEST{i}",
                "class_name": f"Test Class {i}",
            }
            repo.create(db_session, obj_in=TherapeuticClassCreate(**data))
        
        # Get with pagination
        results = repo.get_multi(db_session, skip=0, limit=3)
        
        assert len(results) == 3
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_get_count(self, db_session: Session, repo):
        """Test counting objects."""
        initial_count = repo.get_count(db_session)
        
        # Create one
        data = {"class_code": "COUNT", "class_name": "Count Test"}
        repo.create(db_session, obj_in=TherapeuticClassCreate(**data))
        
        new_count = repo.get_count(db_session)
        
        assert new_count == initial_count + 1
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_update(self, db_session: Session, repo, sample_therapeutic_class_data):
        """Test updating an object."""
        # Create
        obj_in = TherapeuticClassCreate(**sample_therapeutic_class_data)
        created = repo.create(db_session, obj_in=obj_in)
        
        # Update
        update_data = TherapeuticClassUpdate(class_name="Updated Name")
        updated = repo.update(db_session, db_obj=created, obj_in=update_data)
        
        assert updated.class_name == "Updated Name"
        assert updated.class_code == sample_therapeutic_class_data["class_code"]  # Unchanged
    
    @pytest.mark.repository
    @pytest.mark.unit
    def test_remove(self, db_session: Session, repo, sample_therapeutic_class_data):
        """Test removing an object."""
        # Create
        obj_in = TherapeuticClassCreate(**sample_therapeutic_class_data)
        created = repo.create(db_session, obj_in=obj_in)
        class_id = created.class_id
        
        # Remove
        removed = repo.remove(db_session, id=class_id)
        
        assert removed.class_id == class_id
        
        # Verify it's gone
        assert repo.get(db_session, class_id) is None
