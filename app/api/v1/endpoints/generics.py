from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps.dependencies import get_db
from app.schemas.generic import (
    GenericDrugCreate,
    GenericDrugUpdate,
    GenericDrugResponse,
    GenericDrugWithDetails,
)
from app.schemas.alternative import GenericAlternativeWithNames
from app.schemas.common import PaginatedResponse
from app.services.generic import generic_service
from app.services.alternative import alternative_service
from app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[GenericDrugResponse])
def list_generics(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    therapeutic_class_id: int = None,
    db: Session = Depends(get_db),
):
    """List all generic drugs with optional search and filtering."""
    if search:
        items = generic_service.search(db, query=search, skip=skip, limit=limit)
        total = generic_service.get_search_count(db, query=search)
    elif therapeutic_class_id:
        items = generic_service.get_by_therapeutic_class(
            db, class_id=therapeutic_class_id, skip=skip, limit=limit
        )
        total = generic_service.get_count_by_class(db, class_id=therapeutic_class_id)
    else:
        items = generic_service.get_multi(db, skip=skip, limit=limit)
        total = generic_service.repo.get_count(db)

    response_items = []
    for item in items:
        therapeutic_class_name = None
        if item.therapeutic_class:
            therapeutic_class_name = item.therapeutic_class.class_name
        response_items.append(
            GenericDrugResponse(
                **item.__dict__, therapeutic_class_name=therapeutic_class_name
            )
        )

    return PaginatedResponse(total=total, items=response_items, skip=skip, limit=limit)


@router.get("/{generic_id}", response_model=GenericDrugWithDetails)
def get_generic(generic_id: int, db: Session = Depends(get_db)):
    """Get a specific generic drug with details."""
    try:
        item = generic_service.get_with_details(db, generic_id)
        return item
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Generic drug not found"
        )


@router.get(
    "/{generic_id}/alternatives", response_model=List[GenericAlternativeWithNames]
)
def get_generic_alternatives(generic_id: int, db: Session = Depends(get_db)):
    """Get alternative generics for a specific generic drug."""
    try:
        items = alternative_service.get_alternatives_for_generic(
            db, generic_id=generic_id
        )
        return items
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Generic drug not found"
        )


@router.post(
    "/", response_model=GenericDrugResponse, status_code=status.HTTP_201_CREATED
)
def create_generic(obj_in: GenericDrugCreate, db: Session = Depends(get_db)):
    """Create a new generic drug."""
    try:
        item = generic_service.create(db, obj_in=obj_in)
        return GenericDrugResponse.model_validate(item)
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{generic_id}", response_model=GenericDrugResponse)
def update_generic(
    generic_id: int, obj_in: GenericDrugUpdate, db: Session = Depends(get_db)
):
    """Update a generic drug."""
    try:
        item = generic_service.update(db, generic_id=generic_id, obj_in=obj_in)
        return GenericDrugResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Generic drug not found"
        )
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{generic_id}")
def delete_generic(generic_id: int, db: Session = Depends(get_db)):
    """Delete a generic drug."""
    try:
        generic_service.remove(db, generic_id=generic_id)
        return {"message": "Generic drug deleted successfully"}
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Generic drug not found"
        )
