"""Script to seed database with sample test data."""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models import (
    TherapeuticClass,
    DosageForm,
    Manufacturer,
    GenericDrug,
    BrandName,
    DrugPrice,
    Inventory,
)
from app.core.constants import InventoryStatus


def seed_database():
    """Seed database with sample data."""
    db = SessionLocal()
    
    try:
        # Therapeutic Classes
        therapeutic_classes = [
            TherapeuticClass(class_code="N02", class_name="Analgesics", description="Pain relief medications", parent_class_id=None),
            TherapeuticClass(class_code="N02BE", class_name="Anilides", description="Acetaminophen derivatives", parent_class_id=None),
            TherapeuticClass(class_code="N02BA", class_name="Salicylic acid derivatives", description="Aspirin derivatives", parent_class_id=None),
            TherapeuticClass(class_code="N06", class_name="Psychoanaleptics", description="Antidepressants", parent_class_id=None),
        ]
        db.add_all(therapeutic_classes)
        db.commit()
        
        # Dosage Forms
        dosage_forms = [
            DosageForm(form_code="TAB", form_name="Tablet", form_category="solid"),
            DosageForm(form_code="CAP", form_name="Capsule", form_category="solid"),
            DosageForm(form_code="SYR", form_name="Syrup", form_category="liquid"),
            DosageForm(form_code="INJ", form_name="Injection", form_category="liquid"),
        ]
        db.add_all(dosage_forms)
        db.commit()
        
        # Manufacturers
        manufacturers = [
            Manufacturer(
                manufacturer_name="Pfizer Inc.",
                country_code="US",
                license_number="PF-001"
            ),
            Manufacturer(
                manufacturer_name="GSK",
                country_code="UK",
                license_number="GK-001"
            ),
            Manufacturer(
                manufacturer_name="Sanofi",
                country_code="FR",
                license_number="SF-001"
            ),
        ]
        db.add_all(manufacturers)
        db.commit()
        
        # Generic Drugs
        generics = [
            GenericDrug(
                generic_name="Paracetamol",
                chemical_name="N-(4-hydroxyphenyl)acetamide",
                cas_number="103-90-2",
                therapeutic_class_id=1,
                indications="Pain relief, fever reduction"
            ),
            GenericDrug(
                generic_name="Ibuprofen",
                chemical_name="(RS)-2-(4-(2-methylpropyl)phenyl)propanoic acid",
                cas_number="15687-27-1",
                therapeutic_class_id=1,
                indications="Pain relief, anti-inflammatory"
            ),
            GenericDrug(
                generic_name="Amoxicillin",
                chemical_name="(2S,5R,6R)-6-[(R)-2-amino-2-(4-hydroxyphenyl)acetamido]-3,3-dimethyl-7-oxo-4-thia-1-azabicyclo[3.2.0]heptane-2-carboxylic acid",
                cas_number="26787-78-0",
                therapeutic_class_id=1,
                indications="Antibiotic for bacterial infections"
            ),
        ]
        db.add_all(generics)
        db.commit()
        
        # Brands
        brands = [
            BrandName(
                brand_name="Panadol",
                generic_id=1,
                manufacturer_id=1,
                dosage_form_id=1,
                strength_value=500,
                strength_unit="mg",
                package_size="30 tablets",
                ndc_number="12345-678-90",
                barcode="012345678901",
                prescription_required=False,
                status="active"
            ),
            BrandName(
                brand_name="Advil",
                generic_id=2,
                manufacturer_id=2,
                dosage_form_id=1,
                strength_value=400,
                strength_unit="mg",
                package_size="50 tablets",
                ndc_number="12345-678-91",
                barcode="012345678902",
                prescription_required=False,
                status="active"
            ),
            BrandName(
                brand_name="Amoxil",
                generic_id=3,
                manufacturer_id=3,
                dosage_form_id=1,
                strength_value=500,
                strength_unit="mg",
                package_size="20 capsules",
                ndc_number="12345-678-92",
                barcode="012345678903",
                prescription_required=True,
                status="active"
            ),
        ]
        db.add_all(brands)
        db.commit()
        
        # Prices
        prices = [
            DrugPrice(
                brand_id=1,
                acquisition_price=5.00,
                selling_price=15.00,
                effective_date=datetime.now().date(),
                currency="USD"
            ),
            DrugPrice(
                brand_id=2,
                acquisition_price=8.00,
                selling_price=25.00,
                effective_date=datetime.now().date(),
                currency="USD"
            ),
            DrugPrice(
                brand_id=3,
                acquisition_price=12.00,
                selling_price=35.00,
                effective_date=datetime.now().date(),
                currency="USD"
            ),
        ]
        db.add_all(prices)
        db.commit()
        
        # Inventory
        inventory_items = [
            Inventory(
                brand_id=1,
                current_quantity=150,
                minimum_quantity=20,
                maximum_quantity=500,
                reorder_quantity=50,
                batch_number="B001",
                expiry_date=datetime.now() + timedelta(days=365),
                manufacturing_date=datetime.now() - timedelta(days=30),
                location="A1-01",
                status=InventoryStatus.AVAILABLE
            ),
            Inventory(
                brand_id=2,
                current_quantity=15,
                minimum_quantity=20,
                maximum_quantity=300,
                reorder_quantity=50,
                batch_number="B002",
                expiry_date=datetime.now() + timedelta(days=180),
                manufacturing_date=datetime.now() - timedelta(days=60),
                location="A1-02",
                status=InventoryStatus.LOW_STOCK
            ),
            Inventory(
                brand_id=3,
                current_quantity=0,
                minimum_quantity=10,
                maximum_quantity=200,
                reorder_quantity=30,
                batch_number="B003",
                expiry_date=datetime.now() + timedelta(days=90),
                manufacturing_date=datetime.now() - timedelta(days=90),
                location="A2-01",
                status=InventoryStatus.OUT_OF_STOCK
            ),
        ]
        db.add_all(inventory_items)
        db.commit()
        
        print("✅ Database seeded successfully!")
        print(f"   - Therapeutic Classes: {len(therapeutic_classes)}")
        print(f"   - Dosage Forms: {len(dosage_forms)}")
        print(f"   - Manufacturers: {len(manufacturers)}")
        print(f"   - Generic Drugs: {len(generics)}")
        print(f"   - Brands: {len(brands)}")
        print(f"   - Prices: {len(prices)}")
        print(f"   - Inventory Items: {len(inventory_items)}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
