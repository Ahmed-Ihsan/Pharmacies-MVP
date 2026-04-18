from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class DosageFormBase(BaseModel):
    form_code: str
    form_name: str
    form_category: Optional[str] = None
    description: Optional[str] = None


class DosageFormCreate(DosageFormBase):
    pass


class DosageFormUpdate(BaseModel):
    form_code: Optional[str] = None
    form_name: Optional[str] = None
    form_category: Optional[str] = None
    description: Optional[str] = None


class DosageFormInDB(DosageFormBase):
    dosage_form_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DosageFormResponse(DosageFormInDB):
    pass
