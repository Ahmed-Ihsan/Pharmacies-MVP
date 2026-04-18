from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps.dependencies import get_db
from app.schemas.therapeutic_class import (
    TherapeuticClassCreate,
    TherapeuticClassUpdate,
    TherapeuticClassResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.therapeutic_class import therapeutic_class_service
from app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[TherapeuticClassResponse])
def list_therapeutic_classes(
    skip: int = 0, limit: int = 100, search: str = None, db: Session = Depends(get_db)
):
    """List all therapeutic classes with optional search."""
    if search:
        items = therapeutic_class_service.search(
            db, query=search, skip=skip, limit=limit
        )
        total = therapeutic_class_service.get_search_count(db, query=search)
    else:
        items = therapeutic_class_service.get_multi(db, skip=skip, limit=limit)
        total = therapeutic_class_service.repo.get_count(db)

    return PaginatedResponse(
        total=total,
        items=[TherapeuticClassResponse.model_validate(item) for item in items],
        skip=skip,
        limit=limit,
    )


@router.get("/roots", response_model=List[TherapeuticClassResponse])
def get_root_classes(db: Session = Depends(get_db)):
    """Get all root therapeutic classes (no parent)."""
    items = therapeutic_class_service.get_roots(db)
    return [TherapeuticClassResponse.model_validate(item) for item in items]


@router.get("/{class_id}/children", response_model=List[TherapeuticClassResponse])
def get_children(class_id: int, db: Session = Depends(get_db)):
    """Get child classes of a therapeutic class."""
    items = therapeutic_class_service.get_children(db, parent_id=class_id)
    return [TherapeuticClassResponse.model_validate(item) for item in items]


@router.get("/{class_id}", response_model=TherapeuticClassResponse)
def get_therapeutic_class(class_id: int, db: Session = Depends(get_db)):
    """Get a specific therapeutic class by ID."""
    try:
        item = therapeutic_class_service.get(db, class_id)
        return TherapeuticClassResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Therapeutic class not found"
        )


@router.post(
    "/", response_model=TherapeuticClassResponse, status_code=status.HTTP_201_CREATED
)
def create_therapeutic_class(
    obj_in: TherapeuticClassCreate, db: Session = Depends(get_db)
):
    """Create a new therapeutic class."""
    try:
        item = therapeutic_class_service.create(db, obj_in=obj_in)
        return TherapeuticClassResponse.model_validate(item)
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{class_id}", response_model=TherapeuticClassResponse)
def update_therapeutic_class(
    class_id: int, obj_in: TherapeuticClassUpdate, db: Session = Depends(get_db)
):
    """Update a therapeutic class."""
    try:
        item = therapeutic_class_service.update(db, class_id=class_id, obj_in=obj_in)
        return TherapeuticClassResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Therapeutic class not found"
        )
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{class_id}")
def delete_therapeutic_class(class_id: int, db: Session = Depends(get_db)):
    """Delete a therapeutic class."""
    try:
        therapeutic_class_service.remove(db, class_id=class_id)
        return {"message": "Therapeutic class deleted successfully"}
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Therapeutic class not found"
        )
