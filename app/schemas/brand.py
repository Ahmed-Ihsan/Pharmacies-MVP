from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from app.core.constants import DrugStatus, StorageCondition, RouteOfAdministration


class BrandNameBase(BaseModel):
    brand_name: str
    generic_id: int
    manufacturer_id: Optional[int] = None
    dosage_form_id: Optional[int] = None
    strength_value: Optional[Decimal] = None
    strength_unit: Optional[str] = None
    package_size: Optional[str] = None
    ndc_number: Optional[str] = None
    barcode: Optional[str] = None
    atc_code: Optional[str] = None
    prescription_required: bool = True
    storage_conditions: StorageCondition = StorageCondition.ROOM_TEMPERATURE
    route_of_administration: Optional[RouteOfAdministration] = None
    status: DrugStatus = DrugStatus.ACTIVE


class BrandNameCreate(BrandNameBase):
    pass


class BrandNameUpdate(BaseModel):
    brand_name: Optional[str] = None
    generic_id: Optional[int] = None
    manufacturer_id: Optional[int] = None
    dosage_form_id: Optional[int] = None
    strength_value: Optional[Decimal] = None
    strength_unit: Optional[str] = None
    package_size: Optional[str] = None
    ndc_number: Optional[str] = None
    barcode: Optional[str] = None
    atc_code: Optional[str] = None
    prescription_required: Optional[bool] = None
    storage_conditions: Optional[StorageCondition] = None
    route_of_administration: Optional[RouteOfAdministration] = None
    status: Optional[DrugStatus] = None


class BrandNameInDB(BrandNameBase):
    brand_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BrandNameResponse(BrandNameInDB):
    manufacturer_name: Optional[str] = None
    dosage_form_name: Optional[str] = None
    generic_name: Optional[str] = None


class BrandNameWithDetails(BrandNameResponse):
    generic_drug: Optional["GenericDrugResponse"] = None
    manufacturer: Optional["ManufacturerResponse"] = None
    dosage_form: Optional["DosageFormResponse"] = None
