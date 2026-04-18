from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.core.constants import GenericStatus, PregnancyCategory, ControlledSubstanceSchedule


class GenericDrugBase(BaseModel):
    generic_name: str
    chemical_name: Optional[str] = None
    molecular_formula: Optional[str] = None
    cas_number: Optional[str] = None
    therapeutic_class_id: Optional[int] = None
    pharmacology: Optional[str] = None
    indications: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None
    pregnancy_category: Optional[PregnancyCategory] = None
    controlled_substance_schedule: ControlledSubstanceSchedule = ControlledSubstanceSchedule.NONE
    status: GenericStatus = GenericStatus.ACTIVE


class GenericDrugCreate(GenericDrugBase):
    pass


class GenericDrugUpdate(BaseModel):
    generic_name: Optional[str] = None
    chemical_name: Optional[str] = None
    molecular_formula: Optional[str] = None
    cas_number: Optional[str] = None
    therapeutic_class_id: Optional[int] = None
    pharmacology: Optional[str] = None
    indications: Optional[str] = None
    contraindications: Optional[str] = None
    side_effects: Optional[str] = None
    interactions: Optional[str] = None
    pregnancy_category: Optional[PregnancyCategory] = None
    controlled_substance_schedule: Optional[ControlledSubstanceSchedule] = None
    status: Optional[GenericStatus] = None


class GenericDrugInDB(GenericDrugBase):
    generic_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class GenericDrugResponse(GenericDrugInDB):
    therapeutic_class_name: Optional[str] = None


class GenericDrugWithDetails(GenericDrugResponse):
    therapeutic_class: Optional["TherapeuticClassResponse"] = None
    brand_count: int = 0
