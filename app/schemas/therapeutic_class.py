from __future__ import annotations
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class TherapeuticClassBase(BaseModel):
    class_code: str
    class_name: str
    parent_class_id: Optional[int] = None
    description: Optional[str] = None


class TherapeuticClassCreate(TherapeuticClassBase):
    pass


class TherapeuticClassUpdate(BaseModel):
    class_code: Optional[str] = None
    class_name: Optional[str] = None
    parent_class_id: Optional[int] = None
    description: Optional[str] = None


class TherapeuticClassInDB(TherapeuticClassBase):
    class_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TherapeuticClassResponse(TherapeuticClassInDB):
    pass


class TherapeuticClassWithChildren(TherapeuticClassResponse):
    children: List["TherapeuticClassResponse"] = []
