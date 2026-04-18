"""Seed database with initial data for pharmacy management system."""
import sys
import os
from datetime import date

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.base import SessionLocal
from app.services.therapeutic_class import therapeutic_class_service
from app.services.dosage_form import dosage_form_service
from app.services.manufacturer import manufacturer_service
from app.services.generic import generic_service
from app.services.brand import brand_service
from app.services.price import price_service
from app.schemas.therapeutic_class import TherapeuticClassCreate
from app.schemas.dosage_form import DosageFormCreate
from app.schemas.manufacturer import ManufacturerCreate
from app.schemas.generic import GenericDrugCreate
from app.schemas.brand import BrandNameCreate
from app.schemas.price import DrugPriceCreate
from app.core.constants import DrugStatus, GenericStatus, ManufacturerStatus, PregnancyCategory


def seed_therapeutic_classes(db):
    """Seed therapeutic classes."""
    classes = [
        {"class_code": "N02", "class_name": "Analgesics", "description": "Pain relief medications"},
        {"class_code": "N02B", "class_name": "Other Analgesics and Antipyretics", "parent_class_id": None},
        {"class_code": "N02BE", "class_name": "Pyrazolones", "parent_class_id": None},
        {"class_code": "J01", "class_name": "Antibacterials", "description": "Antibiotic medications"},
        {"class_code": "J01C", "class_name": "Beta-Lactam Antibacterials", "parent_class_id": None},
        {"class_code": "J01CA", "class_name": "Penicillins", "parent_class_id": None},
        {"class_code": "C09", "class_name": "Antihypertensives", "description": "Blood pressure medications"},
        {"class_code": "C09A", "class_name": "ACE Inhibitors", "parent_class_id": None},
        {"class_code": "A10", "class_name": "Antidiabetics", "description": "Diabetes medications"},
        {"class_code": "A10B", "class_name": "Blood Glucose Lowering Drugs", "parent_class_id": None},
    ]
    
    created = []
    for cls in classes:
        try:
            obj = therapeutic_class_service.create(db, obj_in=TherapeuticClassCreate(**cls))
            created.append(obj)
            print(f"Created therapeutic class: {obj.class_name}")
        except Exception as e:
            print(f"Skipping therapeutic class {cls['class_name']}: {e}")
    
    return created


def seed_dosage_forms(db):
    """Seed dosage forms."""
    forms = [
        {"form_code": "TAB", "form_name": "Tablet", "form_category": "solid"},
        {"form_code": "CAP", "form_name": "Capsule", "form_category": "solid"},
        {"form_code": "SYP", "form_name": "Syrup", "form_category": "liquid"},
        {"form_code": "INJ", "form_name": "Injection", "form_category": "injectable"},
        {"form_code": "CRE", "form_name": "Cream", "form_category": "semi-solid"},
        {"form_code": "OIN", "form_name": "Ointment", "form_category": "semi-solid"},
        {"form_code": "SOL", "form_name": "Solution", "form_category": "liquid"},
        {"form_code": "SUS", "form_name": "Suspension", "form_category": "liquid"},
    ]
    
    created = []
    for form in forms:
        try:
            obj = dosage_form_service.create(db, obj_in=DosageFormCreate(**form))
            created.append(obj)
            print(f"Created dosage form: {obj.form_name}")
        except Exception as e:
            print(f"Skipping dosage form {form['form_name']}: {e}")
    
    return created


def seed_manufacturers(db):
    """Seed manufacturers."""
    manufacturers = [
        {"manufacturer_name": "Pfizer Inc.", "country_code": "US", "license_number": "US-PF-001"},
        {"manufacturer_name": "Novartis AG", "country_code": "CH", "license_number": "CH-NV-001"},
        {"manufacturer_name": "Roche Holding AG", "country_code": "CH", "license_number": "CH-RC-001"},
        {"manufacturer_name": "Sanofi S.A.", "country_code": "FR", "license_number": "FR-SN-001"},
        {"manufacturer_name": "Merck & Co.", "country_code": "US", "license_number": "US-MK-001"},
        {"manufacturer_name": "GlaxoSmithKline", "country_code": "GB", "license_number": "GB-GS-001"},
        {"manufacturer_name": "AstraZeneca", "country_code": "GB", "license_number": "GB-AZ-001"},
        {"manufacturer_name": "Johnson & Johnson", "country_code": "US", "license_number": "US-JJ-001"},
    ]
    
    created = []
    for mfr in manufacturers:
        try:
            obj = manufacturer_service.create(db, obj_in=ManufacturerCreate(**mfr))
            created.append(obj)
            print(f"Created manufacturer: {obj.manufacturer_name}")
        except Exception as e:
            print(f"Skipping manufacturer {mfr['manufacturer_name']}: {e}")
    
    return created


def seed_generics(db):
    """Seed generic drugs."""
    generics = [
        {
            "generic_name": "Paracetamol",
            "chemical_name": "N-(4-hydroxyphenyl)acetamide",
            "molecular_formula": "C8H9NO2",
            "cas_number": "103-90-2",
            "therapeutic_class_id": 1,
            "indications": "Pain relief and fever reduction",
            "side_effects": "Liver damage in overdose, allergic reactions",
            "pregnancy_category": "B",
        },
        {
            "generic_name": "Ibuprofen",
            "chemical_name": "2-(4-isobutylphenyl)propionic acid",
            "molecular_formula": "C13H18O2",
            "cas_number": "15687-27-1",
            "therapeutic_class_id": 1,
            "indications": "Pain relief, anti-inflammatory, fever reduction",
            "side_effects": "Stomach upset, ulcers, kidney problems",
            "pregnancy_category": "D",
        },
        {
            "generic_name": "Amoxicillin",
            "chemical_name": "7-[D-(-)-4-amino-4-hydroxyphenylacetamido]desacetoxycephalosporanic acid",
            "molecular_formula": "C16H19N3O5S",
            "cas_number": "26787-78-0",
            "therapeutic_class_id": 4,
            "indications": "Bacterial infections",
            "side_effects": "Diarrhea, rash, allergic reactions",
            "pregnancy_category": "B",
        },
        {
            "generic_name": "Metformin",
            "chemical_name": "N,N-dimethylimidodicarbonimidic diamide",
            "molecular_formula": "C4H11N5",
            "cas_number": "657-24-9",
            "therapeutic_class_id": 9,
            "indications": "Type 2 diabetes",
            "side_effects": "Stomach upset, diarrhea, lactic acidosis (rare)",
            "pregnancy_category": "B",
        },
        {
            "generic_name": "Lisinopril",
            "chemical_name": "1-[N2-(1-carboxy-3-phenylpropyl)-L-lysyl]-L-proline",
            "molecular_formula": "C21H31N3O5",
            "cas_number": "83915-83-7",
            "therapeutic_class_id": 8,
            "indications": "Hypertension, heart failure",
            "side_effects": "Dry cough, dizziness, hyperkalemia",
            "pregnancy_category": "D",
        },
    ]
    
    created = []
    for gen in generics:
        try:
            obj = generic_service.create(db, obj_in=GenericDrugCreate(**gen))
            created.append(obj)
            print(f"Created generic: {obj.generic_name}")
        except Exception as e:
            print(f"Skipping generic {gen['generic_name']}: {e}")
    
    return created


def seed_brands(db):
    """Seed brand names."""
    brands = [
        {
            "brand_name": "Tylenol",
            "generic_id": 1,
            "manufacturer_id": 8,
            "dosage_form_id": 1,
            "strength_value": 500,
            "strength_unit": "mg",
            "package_size": "100 tablets",
            "ndc_number": "50580-011-00",
            "barcode": "030550550011",
            "prescription_required": False,
        },
        {
            "brand_name": "Advil",
            "generic_id": 2,
            "manufacturer_id": 8,
            "dosage_form_id": 1,
            "strength_value": 200,
            "strength_unit": "mg",
            "package_size": "50 tablets",
            "ndc_number": "0573-0160-50",
            "barcode": "305730160501",
            "prescription_required": False,
        },
        {
            "brand_name": "Motrin",
            "generic_id": 2,
            "manufacturer_id": 8,
            "dosage_form_id": 1,
            "strength_value": 400,
            "strength_unit": "mg",
            "package_size": "90 tablets",
            "ndc_number": "00045-0090-90",
            "barcode": "300450090900",
            "prescription_required": True,
        },
        {
            "brand_name": "Amoxil",
            "generic_id": 3,
            "manufacturer_id": 1,
            "dosage_form_id": 3,
            "strength_value": 250,
            "strength_unit": "mg/5mL",
            "package_size": "100 mL",
            "ndc_number": "0071-0800-40",
            "barcode": "007100800401",
            "prescription_required": True,
        },
        {
            "brand_name": "Glucophage",
            "generic_id": 4,
            "manufacturer_id": 1,
            "dosage_form_id": 1,
            "strength_value": 500,
            "strength_unit": "mg",
            "package_size": "100 tablets",
            "ndc_number": "00071-0080-00",
            "barcode": "007100080001",
            "prescription_required": True,
        },
        {
            "brand_name": "Zestril",
            "generic_id": 5,
            "manufacturer_id": 1,
            "dosage_form_id": 1,
            "strength_value": 10,
            "strength_unit": "mg",
            "package_size": "90 tablets",
            "ndc_number": "0071-0400-90",
            "barcode": "007104009000",
            "prescription_required": True,
        },
    ]
    
    created = []
    for brand in brands:
        try:
            obj = brand_service.create(db, obj_in=BrandNameCreate(**brand))
            created.append(obj)
            print(f"Created brand: {obj.brand_name}")
        except Exception as e:
            print(f"Skipping brand {brand['brand_name']}: {e}")
    
    return created


def seed_prices(db):
    """Seed drug prices."""
    prices = [
        {"brand_id": 1, "acquisition_price": 5.50, "selling_price": 12.99, "effective_date": date(2024, 1, 1)},
        {"brand_id": 2, "acquisition_price": 4.25, "selling_price": 9.99, "effective_date": date(2024, 1, 1)},
        {"brand_id": 3, "acquisition_price": 15.00, "selling_price": 35.00, "effective_date": date(2024, 1, 1)},
        {"brand_id": 4, "acquisition_price": 8.00, "selling_price": 18.50, "effective_date": date(2024, 1, 1)},
        {"brand_id": 5, "acquisition_price": 25.00, "selling_price": 55.00, "effective_date": date(2024, 1, 1)},
        {"brand_id": 6, "acquisition_price": 30.00, "selling_price": 65.00, "effective_date": date(2024, 1, 1)},
    ]
    
    created = []
    for price in prices:
        try:
            obj = price_service.create(db, obj_in=DrugPriceCreate(**price))
            created.append(obj)
            print(f"Created price for brand_id: {obj.brand_id}")
        except Exception as e:
            print(f"Skipping price for brand_id {price['brand_id']}: {e}")
    
    return created


def main():
    print("Starting database seeding...")
    db = SessionLocal()
    
    try:
        print("\n--- Seeding Therapeutic Classes ---")
        seed_therapeutic_classes(db)
        
        print("\n--- Seeding Dosage Forms ---")
        seed_dosage_forms(db)
        
        print("\n--- Seeding Manufacturers ---")
        seed_manufacturers(db)
        
        print("\n--- Seeding Generic Drugs ---")
        seed_generics(db)
        
        print("\n--- Seeding Brand Names ---")
        seed_brands(db)
        
        print("\n--- Seeding Prices ---")
        seed_prices(db)
        
        print("\n✓ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
