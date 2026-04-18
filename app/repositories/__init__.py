from app.repositories.therapeutic_class import therapeutic_class_repository
from app.repositories.dosage_form import dosage_form_repository
from app.repositories.manufacturer import manufacturer_repository
from app.repositories.generic import generic_repository
from app.repositories.brand import brand_repository
from app.repositories.alternative import alternative_repository
from app.repositories.price import price_repository

__all__ = [
    "therapeutic_class_repository",
    "dosage_form_repository",
    "manufacturer_repository",
    "generic_repository",
    "brand_repository",
    "alternative_repository",
    "price_repository",
]
