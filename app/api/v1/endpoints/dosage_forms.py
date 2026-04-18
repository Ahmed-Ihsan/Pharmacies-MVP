from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps.dependencies import get_db
from app.schemas.dosage_form import (
    DosageFormCreate,
    DosageFormUpdate,
    DosageFormResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.dosage_form import dosage_form_service
from app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[DosageFormResponse])
def list_dosage_forms(
    skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)
):
    """List all dosage forms with optional search."""
    if search:
        items = dosage_form_service.search(db, query=search, skip=skip, limit=limit)
        total = dosage_form_service.get_search_count(db, query=search)
    else:
        items = dosage_form_service.get_multi(db, skip=skip, limit=limit)
        total = dosage_form_service.repo.get_count(db)

    return PaginatedResponse(
        total=total,
        items=[DosageFormResponse.model_validate(item) for item in items],
        skip=skip,
        limit=limit,
    )


@router.get("/{dosage_form_id}", response_model=DosageFormResponse)
def get_dosage_form(dosage_form_id: int, db: Session = Depends(get_db)):
    """Get a specific dosage form by ID."""
    try:
        item = dosage_form_service.get(db, dosage_form_id)
        return DosageFormResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dosage form not found"
        )


@router.post(
    "/", response_model=DosageFormResponse, status_code=status.HTTP_201_CREATED
)
def create_dosage_form(obj_in: DosageFormCreate, db: Session = Depends(get_db)):
    """Create a new dosage form."""
    try:
        item = dosage_form_service.create(db, obj_in=obj_in)
        return DosageFormResponse.model_validate(item)
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{dosage_form_id}", response_model=DosageFormResponse)
def update_dosage_form(
    dosage_form_id: int, obj_in: DosageFormUpdate, db: Session = Depends(get_db)
):
    """Update a dosage form."""
    try:
        item = dosage_form_service.update(
            db, dosage_form_id=dosage_form_id, obj_in=obj_in
        )
        return DosageFormResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dosage form not found"
        )
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{dosage_form_id}")
def delete_dosage_form(dosage_form_id: int, db: Session = Depends(get_db)):
    """Delete a dosage form."""
    try:
        dosage_form_service.remove(db, dosage_form_id=dosage_form_id)
        return {"message": "Dosage form deleted successfully"}
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dosage form not found"
        )
