from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps.dependencies import get_db
from app.schemas.brand import (
    BrandNameCreate,
    BrandNameUpdate,
    BrandNameResponse,
    BrandNameWithDetails,
)
from app.schemas.price import DrugPriceResponse
from app.schemas.common import PaginatedResponse
from app.services.brand import brand_service
from app.services.price import price_service
from app.core.exceptions import NotFoundException, DuplicateException

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[BrandNameResponse])
def list_brands(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    generic_id: int = None,
    manufacturer_id: int = None,
    db: Session = Depends(get_db),
):
    """List all brand names with optional search and filtering."""
    if search:
        items = brand_service.search(db, query=search, skip=skip, limit=limit)
        total = brand_service.get_search_count(db, query=search)
    elif generic_id:
        items = brand_service.get_by_generic(
            db, generic_id=generic_id, skip=skip, limit=limit
        )
        total = brand_service.get_count_by_generic(db, generic_id=generic_id)
    elif manufacturer_id:
        items = brand_service.get_by_manufacturer(
            db, manufacturer_id=manufacturer_id, skip=skip, limit=limit
        )
        total = brand_service.get_count_by_manufacturer(
            db, manufacturer_id=manufacturer_id
        )
    else:
        items = brand_service.get_multi(db, skip=skip, limit=limit)
        total = brand_service.repo.get_count(db)

    return PaginatedResponse(
        total=total,
        items=[BrandNameResponse.model_validate(item) for item in items],
        skip=skip,
        limit=limit,
    )


@router.get("/by-ndc/{ndc_number}", response_model=BrandNameResponse)
def get_brand_by_ndc(ndc_number: str, db: Session = Depends(get_db)):
    """Get a brand by NDC number."""
    item = brand_service.get_by_ndc(db, ndc_number)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )
    return BrandNameResponse.model_validate(item)


@router.get("/by-barcode/{barcode}", response_model=BrandNameResponse)
def get_brand_by_barcode(barcode: str, db: Session = Depends(get_db)):
    """Get a brand by barcode."""
    item = brand_service.get_by_barcode(db, barcode)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )
    return BrandNameResponse.model_validate(item)


@router.get("/{brand_id}", response_model=BrandNameWithDetails)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    """Get a specific brand with details."""
    try:
        item = brand_service.get_with_details(db, brand_id)
        return item
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )


@router.get("/{brand_id}/prices", response_model=List[DrugPriceResponse])
def get_brand_prices(
    brand_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Get price history for a brand."""
    try:
        # Verify brand exists
        brand_service.get(db, brand_id)
        items = price_service.get_by_brand(
            db, brand_id=brand_id, skip=skip, limit=limit
        )
        return [DrugPriceResponse.model_validate(item) for item in items]
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )


@router.post("/", response_model=BrandNameResponse, status_code=status.HTTP_201_CREATED)
def create_brand(obj_in: BrandNameCreate, db: Session = Depends(get_db)):
    """Create a new brand name."""
    try:
        item = brand_service.create(db, obj_in=obj_in)
        return BrandNameResponse.model_validate(item)
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{brand_id}", response_model=BrandNameResponse)
def update_brand(brand_id: int, obj_in: BrandNameUpdate, db: Session = Depends(get_db)):
    """Update a brand name."""
    try:
        item = brand_service.update(db, brand_id=brand_id, obj_in=obj_in)
        return BrandNameResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )
    except DuplicateException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db)):
    """Delete a brand name."""
    try:
        brand_service.remove(db, brand_id=brand_id)
        return {"message": "Brand deleted successfully"}
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )
