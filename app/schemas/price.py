from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class DrugPriceBase(BaseModel):
    brand_id: int
    acquisition_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    effective_date: date
    currency: str = "USD"


class DrugPriceCreate(DrugPriceBase):
    pass


class DrugPriceUpdate(BaseModel):
    acquisition_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    effective_date: Optional[date] = None
    currency: Optional[str] = None


class DrugPriceInDB(DrugPriceBase):
    price_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DrugPriceResponse(DrugPriceInDB):
    pass


class DrugPriceWithBrand(DrugPriceResponse):
    brand_name: Optional["BrandNameResponse"] = None
