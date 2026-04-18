from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps.dependencies import get_db
from app.schemas.price import (
    DrugPriceCreate,
    DrugPriceUpdate,
    DrugPriceResponse,
    DrugPriceWithBrand,
)
from app.schemas.common import PaginatedResponse
from app.services.price import price_service
from app.services.brand import brand_service
from app.core.exceptions import NotFoundException

router = APIRouter()


@router.get("/by-brand/{brand_id}", response_model=PaginatedResponse[DrugPriceResponse])
def list_prices_by_brand(
    brand_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """List all prices for a specific brand."""
    try:
        # Verify brand exists
        brand_service.get(db, brand_id)
        items = price_service.get_by_brand(
            db, brand_id=brand_id, skip=skip, limit=limit
        )
        total = price_service.get_count_by_brand(db, brand_id=brand_id)

        return PaginatedResponse(
            total=total,
            items=[DrugPriceResponse.model_validate(item) for item in items],
            skip=skip,
            limit=limit,
        )
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )


@router.get("/active/{brand_id}", response_model=DrugPriceResponse)
def get_active_price(brand_id: int, as_of: date = None, db: Session = Depends(get_db)):
    """Get the active price for a brand as of a specific date (default: today)."""
    try:
        # Verify brand exists
        brand_service.get(db, brand_id)
        item = price_service.get_active_price(db, brand_id=brand_id, as_of_date=as_of)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="No active price found"
            )
        return DrugPriceResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )


@router.get("/{price_id}", response_model=DrugPriceWithBrand)
def get_price(price_id: int, db: Session = Depends(get_db)):
    """Get a specific price entry with brand details."""
    try:
        item = price_service.get_with_brand(db, price_id)
        return item
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Price not found"
        )


@router.post("/", response_model=DrugPriceResponse, status_code=status.HTTP_201_CREATED)
def create_price(obj_in: DrugPriceCreate, db: Session = Depends(get_db)):
    """Create a new price entry."""
    try:
        # Verify brand exists
        brand_service.get(db, obj_in.brand_id)
        item = price_service.create(db, obj_in=obj_in)
        return DrugPriceResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found"
        )


@router.put("/{price_id}", response_model=DrugPriceResponse)
def update_price(price_id: int, obj_in: DrugPriceUpdate, db: Session = Depends(get_db)):
    """Update a price entry."""
    try:
        item = price_service.update(db, price_id=price_id, obj_in=obj_in)
        return DrugPriceResponse.model_validate(item)
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Price not found"
        )


@router.delete("/{price_id}")
def delete_price(price_id: int, db: Session = Depends(get_db)):
    """Delete a price entry."""
    try:
        price_service.remove(db, price_id=price_id)
        return {"message": "Price deleted successfully"}
    except NotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Price not found"
        )
