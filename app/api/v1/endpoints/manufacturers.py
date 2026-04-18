from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps.dependencies import get_db
from app.schemas.manufacturer import (
    ManufacturerCreate,
    ManufacturerUpdate,
    ManufacturerResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.manufacturer import manufacturer_service
from app.core.exceptions import NotFoundException

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ManufacturerResponse])
def list_manufacturers(
    skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)
):
    """List all manufacturers with optional search."""
    if search:
        items = manufacturer_service.search(db, query=search, skip=skip, limit=limit)
        total = manufacturer_service.get_search_count(db, query=search)
    else:
        items = manufacturer_service.get_multi(db, skip=skip, limit=limit)
        total = manufacturer_service.repo.get_count(db)

    return PaginatedResponse(
        total=total,
        items=[ManufacturerResponse.model_validate(item) for item in items],
        skip=skip,
        limit=limit,
    )


@router.get("/{manufacturer_id}", response_model=ManufacturerResponse)
def get_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    """Get a specific manufacturer by ID."""
    try:
        item = manufacturer_service.get(db, manufacturer_id)
        return ManufacturerResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Manufacturer not found"
        )


@router.post(
    "/", response_model=ManufacturerResponse, status_code=status.HTTP_201_CREATED
)
def create_manufacturer(obj_in: ManufacturerCreate, db: Session = Depends(get_db)):
    """Create a new manufacturer."""
    item = manufacturer_service.create(db, obj_in=obj_in)
    return ManufacturerResponse.model_validate(item)


@router.put("/{manufacturer_id}", response_model=ManufacturerResponse)
def update_manufacturer(
    manufacturer_id: int, obj_in: ManufacturerUpdate, db: Session = Depends(get_db)
):
    """Update a manufacturer."""
    try:
        item = manufacturer_service.update(
            db, manufacturer_id=manufacturer_id, obj_in=obj_in
        )
        return ManufacturerResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Manufacturer not found"
        )


@router.delete("/{manufacturer_id}")
def delete_manufacturer(manufacturer_id: int, db: Session = Depends(get_db)):
    """Delete a manufacturer."""
    try:
        manufacturer_service.remove(db, manufacturer_id=manufacturer_id)
        return {"message": "Manufacturer deleted successfully"}
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Manufacturer not found"
        )
