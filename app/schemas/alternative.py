from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class GenericAlternativeBase(BaseModel):
    primary_generic_id: int
    alternative_generic_id: int
    bioequivalence_status: Optional[str] = None
    notes: Optional[str] = None


class GenericAlternativeCreate(GenericAlternativeBase):
    pass


class GenericAlternativeUpdate(BaseModel):
    bioequivalence_status: Optional[str] = None
    notes: Optional[str] = None


class GenericAlternativeInDB(GenericAlternativeBase):
    alternative_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenericAlternativeResponse(GenericAlternativeInDB):
    primary_generic_name: Optional[str] = None
    alternative_generic_name: Optional[str] = None


class GenericAlternativeWithNames(GenericAlternativeResponse):
    primary_generic: Optional["GenericDrugResponse"] = None
    alternative_generic: Optional["GenericDrugResponse"] = None
