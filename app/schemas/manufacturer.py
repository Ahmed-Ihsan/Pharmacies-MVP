from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
from app.core.constants import ManufacturerStatus


class ManufacturerBase(BaseModel):
    manufacturer_name: str
    country_code: Optional[str] = None
    license_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: ManufacturerStatus = ManufacturerStatus.ACTIVE


class ManufacturerCreate(ManufacturerBase):
    pass


class ManufacturerUpdate(BaseModel):
    manufacturer_name: Optional[str] = None
    country_code: Optional[str] = None
    license_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    status: Optional[ManufacturerStatus] = None


class ManufacturerInDB(ManufacturerBase):
    manufacturer_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class ManufacturerResponse(ManufacturerInDB):
    pass
