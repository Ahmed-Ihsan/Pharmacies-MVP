from pydantic import BaseModel, ConfigDict
from typing import Generic, TypeVar, List, Optional
from datetime import datetime


T = TypeVar("T")


class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 100
    
    
class PaginatedResponse(BaseModel, Generic[T]):
    total: int
    items: List[T]
    skip: int
    limit: int
    
    
class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None
    timestamp: datetime = datetime.utcnow()
    
    model_config = ConfigDict(json_encoders={
        datetime: lambda v: v.isoformat()
    })
