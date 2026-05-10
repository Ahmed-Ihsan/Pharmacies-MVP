from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from app.db.base import get_db
from app.services.sale import SaleService
from app.schemas.sale import SaleCreate, SaleUpdate, SaleReturnCreate, SaleWithDetails
from app.core.constants import SaleStatus

router = APIRouter()
sale_service = SaleService()


@router.post("/", response_model=dict)
def create_sale(sale_data: SaleCreate, db: Session = Depends(get_db)):
    """Create a new sale with inventory updates."""
    try:
        sale = sale_service.create_sale(db, sale_data)
        return sale
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{sale_id}", response_model=dict)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    """Get a sale by ID with details."""
    try:
        sale = sale_service.get_sale_with_details(db, sale_id)
        return sale
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/", response_model=List[dict])
def list_sales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=0, le=1000),
    status: Optional[SaleStatus] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """List sales with optional filters."""
    sales = sale_service.list_sales(db, skip, limit, status, start_date, end_date)
    return [
        {
            "sale_id": sale.sale_id,
            "invoice_number": sale.invoice_number,
            "customer_name": sale.customer_name,
            "total_amount": float(sale.total_amount),
            "status": sale.status.value,
            "created_at": sale.created_at.isoformat() if sale.created_at else None
        }
        for sale in sales
    ]


@router.put("/{sale_id}", response_model=dict)
def update_sale(sale_id: int, sale_data: SaleUpdate, db: Session = Depends(get_db)):
    """Update a sale."""
    try:
        sale = sale_service.update_sale(db, sale_id, sale_data)
        return {
            "sale_id": sale.sale_id,
            "invoice_number": sale.invoice_number,
            "customer_name": sale.customer_name,
            "total_amount": float(sale.total_amount),
            "status": sale.status.value,
            "updated_at": sale.updated_at.isoformat() if sale.updated_at else None
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{sale_id}/cancel", response_model=dict)
def cancel_sale(sale_id: int, db: Session = Depends(get_db)):
    """Cancel a sale and restore inventory."""
    try:
        sale = sale_service.cancel_sale(db, sale_id)
        return {
            "sale_id": sale.sale_id,
            "invoice_number": sale.invoice_number,
            "status": sale.status.value,
            "message": "Sale cancelled successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/search", response_model=dict)
def search_sale(invoice_number: str = Query(...), db: Session = Depends(get_db)):
    """Search for a sale by invoice number."""
    try:
        sale = sale_service.get_by_invoice_number(db, invoice_number)
        if sale:
            return sale_service.get_sale_with_details(db, sale.sale_id)
        raise HTTPException(status_code=404, detail="Sale not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/returns", response_model=dict)
def process_return(return_data: SaleReturnCreate, db: Session = Depends(get_db)):
    """Process a sale return with inventory restoration."""
    try:
        sale_return = sale_service.process_return(db, return_data)
        return {
            "return_id": sale_return.return_id,
            "return_number": sale_return.return_number,
            "sale_id": sale_return.sale_id,
            "refund_amount": float(sale_return.refund_amount),
            "status": sale_return.status.value,
            "message": "Return processed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/returns/list", response_model=List[dict])
def list_returns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=0, le=1000),
    status: Optional[SaleStatus] = None,
    db: Session = Depends(get_db)
):
    """List sale returns with optional filters."""
    returns = sale_service.list_returns(db, skip, limit, status)
    return [
        {
            "return_id": ret.return_id,
            "return_number": ret.return_number,
            "sale_id": ret.sale_id,
            "refund_amount": float(ret.refund_amount),
            "status": ret.status.value,
            "created_at": ret.created_at.isoformat() if ret.created_at else None
        }
        for ret in returns
    ]


@router.get("/returns/{return_id}", response_model=dict)
def get_return(return_id: int, db: Session = Depends(get_db)):
    """Get a sale return by ID."""
    try:
        sale_return = sale_service.get_return(db, return_id)
        return {
            "return_id": sale_return.return_id,
            "return_number": sale_return.return_number,
            "sale_id": sale_return.sale_id,
            "reason": sale_return.reason,
            "total_amount": float(sale_return.total_amount),
            "refund_amount": float(sale_return.refund_amount),
            "status": sale_return.status.value,
            "created_at": sale_return.created_at.isoformat() if sale_return.created_at else None,
            "processed_at": sale_return.processed_at.isoformat() if sale_return.processed_at else None
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
