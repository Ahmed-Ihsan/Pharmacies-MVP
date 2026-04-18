"""Pytest configuration and shared fixtures."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.db.base import Base, get_db
from app.main import app


# Test database URL (in-memory SQLite)
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def engine():
    """Create a test database engine."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(engine) -> Session:
    """Create a new database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session) -> TestClient:
    """Create a test client with overridden database dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# Sample data fixtures
@pytest.fixture
def sample_therapeutic_class_data():
    """Sample therapeutic class data."""
    return {
        "class_code": "N02",
        "class_name": "Analgesics",
        "description": "Pain relief medications",
    }


@pytest.fixture
def sample_dosage_form_data():
    """Sample dosage form data."""
    return {
        "form_code": "TAB",
        "form_name": "Tablet",
        "form_category": "solid",
    }


@pytest.fixture
def sample_manufacturer_data():
    """Sample manufacturer data."""
    return {
        "manufacturer_name": "Test Pharma Inc.",
        "country_code": "US",
        "license_number": "TEST-001",
    }


@pytest.fixture
def sample_generic_drug_data():
    """Sample generic drug data."""
    return {
        "generic_name": "Test Generic",
        "chemical_name": "Test Chemical Name",
        "cas_number": "12345-67-8",
        "indications": "Test indication",
    }


@pytest.fixture
def sample_brand_data():
    """Sample brand name data."""
    return {
        "brand_name": "Test Brand",
        "strength_value": 500,
        "strength_unit": "mg",
        "package_size": "30 tablets",
        "ndc_number": "12345-678-90",
        "barcode": "012345678901",
    }


@pytest.fixture
def sample_price_data():
    """Sample price data."""
    from datetime import date
    return {
        "acquisition_price": 10.50,
        "selling_price": 25.99,
        "effective_date": date(2024, 1, 1),
        "currency": "USD",
    }
