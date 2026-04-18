"""Initialize database - create all tables."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.base import engine, Base
from app.models import (
    TherapeuticClass,
    DosageForm,
    Manufacturer,
    GenericDrug,
    BrandName,
    GenericAlternative,
    DrugPrice,
)

def init_database():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_database()
