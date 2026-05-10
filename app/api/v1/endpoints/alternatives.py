from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps.dependencies import get_db
from app.schemas.alternative import (
    GenericAlternativeCreate,
    GenericAlternativeUpdate,
    GenericAlternativeResponse,
    GenericAlternativeWithNames,
)
from app.schemas.common import PaginatedResponse
from app.services.alternative import alternative_service
from app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[GenericAlternativeWithNames])
def list_alternatives(
    skip: int = 0,
    limit: int = 100,
    primary_generic_id: int = None,
    db: Session = Depends(get_db),
):
    """List all generic alternatives with optional filtering."""
    if primary_generic_id:
        items = alternative_service.get_alternatives_for_generic(db, primary_generic_id)
        total = alternative_service.get_count_by_primary_generic(db, primary_generic_id)
    else:
        items = alternative_service.repo.get_multi_with_details(db, skip=skip, limit=limit)
        total = alternative_service.repo.get_count(db)

    return PaginatedResponse(
        total=total,
        items=[GenericAlternativeWithNames.model_validate(item) for item in items],
        skip=skip,
        limit=limit,
    )


@router.get("/{alternative_id}", response_model=GenericAlternativeWithNames)
def get_alternative(alternative_id: int, db: Session = Depends(get_db)):
    """Get a specific generic alternative with names."""
    try:
        item = alternative_service.get_with_details(db, alternative_id)
        return item
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alternative not found"
        )


@router.post(
    "/", response_model=GenericAlternativeResponse, status_code=status.HTTP_201_CREATED
)
def create_alternative(obj_in: GenericAlternativeCreate, db: Session = Depends(get_db)):
    """Create a new generic alternative relationship."""
    try:
        item = alternative_service.create(db, obj_in=obj_in)
        return GenericAlternativeResponse.model_validate(item)
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{alternative_id}", response_model=GenericAlternativeResponse)
def update_alternative(
    alternative_id: int, obj_in: GenericAlternativeUpdate, db: Session = Depends(get_db)
):
    """Update a generic alternative."""
    try:
        item = alternative_service.update(
            db, alternative_id=alternative_id, obj_in=obj_in
        )
        return GenericAlternativeResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alternative not found"
        )


@router.delete("/{alternative_id}")
def delete_alternative(alternative_id: int, db: Session = Depends(get_db)):
    """Delete a generic alternative."""
    try:
        alternative_service.remove(db, alternative_id=alternative_id)
        return {"message": "Alternative deleted successfully"}
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alternative not found"
        )
