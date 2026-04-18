from app.schemas.common import PaginationParams, PaginatedResponse, APIResponse
from app.schemas.therapeutic_class import (
    TherapeuticClassCreate,
    TherapeuticClassUpdate,
    TherapeuticClassResponse,
    TherapeuticClassWithChildren,
)
from app.schemas.dosage_form import (
    DosageFormCreate,
    DosageFormUpdate,
    DosageFormResponse,
)
from app.schemas.manufacturer import (
    ManufacturerCreate,
    ManufacturerUpdate,
    ManufacturerResponse,
)
from app.schemas.generic import (
    GenericDrugCreate,
    GenericDrugUpdate,
    GenericDrugResponse,
    GenericDrugWithDetails,
)
from app.schemas.brand import (
    BrandNameCreate,
    BrandNameUpdate,
    BrandNameResponse,
    BrandNameWithDetails,
)
from app.schemas.alternative import (
    GenericAlternativeCreate,
    GenericAlternativeUpdate,
    GenericAlternativeResponse,
    GenericAlternativeWithNames,
)
from app.schemas.price import (
    DrugPriceCreate,
    DrugPriceUpdate,
    DrugPriceResponse,
    DrugPriceWithBrand,
)

__all__ = [
    # Common
    "PaginationParams",
    "PaginatedResponse",
    "APIResponse",
    # Therapeutic Classes
    "TherapeuticClassCreate",
    "TherapeuticClassUpdate",
    "TherapeuticClassResponse",
    "TherapeuticClassWithChildren",
    # Dosage Forms
    "DosageFormCreate",
    "DosageFormUpdate",
    "DosageFormResponse",
    # Manufacturers
    "ManufacturerCreate",
    "ManufacturerUpdate",
    "ManufacturerResponse",
    # Generic Drugs
    "GenericDrugCreate",
    "GenericDrugUpdate",
    "GenericDrugResponse",
    "GenericDrugWithDetails",
    # Brand Names
    "BrandNameCreate",
    "BrandNameUpdate",
    "BrandNameResponse",
    "BrandNameWithDetails",
    # Alternatives
    "GenericAlternativeCreate",
    "GenericAlternativeUpdate",
    "GenericAlternativeResponse",
    "GenericAlternativeWithNames",
    # Prices
    "DrugPriceCreate",
    "DrugPriceUpdate",
    "DrugPriceResponse",
    "DrugPriceWithBrand",
]

# Rebuild models with forward references after all imports
TherapeuticClassWithChildren.model_rebuild()
GenericDrugWithDetails.model_rebuild()
BrandNameWithDetails.model_rebuild()
GenericAlternativeWithNames.model_rebuild()
DrugPriceWithBrand.model_rebuild()
