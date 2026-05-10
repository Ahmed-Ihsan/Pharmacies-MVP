from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime
from typing import List, Optional
from app.models.sale import Sale, SaleItem, Payment, SaleReturn, ReturnItem
from app.schemas.sale import SaleCreate, SaleUpdate, SaleReturnCreate, PaymentCreate
from app.repositories.base import BaseRepository
from app.core.constants import SaleStatus


class SaleRepository(BaseRepository[Sale, SaleCreate, SaleUpdate]):
    def __init__(self):
        super().__init__(Sale)
    
    def get_by_invoice_number(self, db: Session, invoice_number: str) -> Optional[Sale]:
        return db.query(Sale).filter(Sale.invoice_number == invoice_number).first()
    
    def get_with_details(self, db: Session, sale_id: int) -> Optional[Sale]:
        return db.query(Sale).filter(Sale.sale_id == sale_id).first()
    
    def list_sales(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[SaleStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Sale]:
        query = db.query(Sale)
        
        if status:
            query = query.filter(Sale.status == status)
        
        if start_date:
            query = query.filter(Sale.created_at >= start_date)
        
        if end_date:
            query = query.filter(Sale.created_at <= end_date)
        
        return query.order_by(desc(Sale.created_at)).offset(skip).limit(limit).all()
    
    def generate_invoice_number(self, db: Session) -> str:
        """Generate a unique invoice number."""
        today = datetime.now().strftime("%Y%m%d")
        last_invoice = db.query(Sale).filter(
            Sale.invoice_number.like(f"INV-{today}%")
        ).order_by(desc(Sale.sale_id)).first()
        
        if last_invoice:
            last_num = int(last_invoice.invoice_number.split("-")[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f"INV-{today}-{new_num:04d}"


class SaleItemRepository(BaseRepository[SaleItem, SaleCreate, SaleUpdate]):
    def __init__(self):
        super().__init__(SaleItem)
    
    def get_by_sale(self, db: Session, sale_id: int) -> List[SaleItem]:
        return db.query(SaleItem).filter(SaleItem.sale_id == sale_id).all()


class PaymentRepository(BaseRepository[Payment, PaymentCreate, PaymentCreate]):
    def __init__(self):
        super().__init__(Payment)
    
    def get_by_sale(self, db: Session, sale_id: int) -> List[Payment]:
        return db.query(Payment).filter(Payment.sale_id == sale_id).all()


class SaleReturnRepository:
    def create(self, db: Session, return_data: SaleReturnCreate) -> SaleReturn:
        """Create a new sale return."""
        # Generate return number
        today = datetime.now().strftime("%Y%m%d")
        last_return = db.query(SaleReturn).filter(
            SaleReturn.return_number.like(f"RET-{today}%")
        ).order_by(desc(SaleReturn.return_id)).first()
        
        if last_return:
            last_num = int(last_return.return_number.split("-")[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return_number = f"RET-{today}-{new_num:04d}"
        
        # Create sale return
        sale_return = SaleReturn(
            sale_id=return_data.sale_id,
            return_number=return_number,
            reason=return_data.reason,
            total_amount=return_data.total_amount,
            refund_amount=return_data.refund_amount,
            status=return_data.status,
            notes=return_data.notes
        )
        
        db.add(sale_return)
        db.flush()
        
        # Create return items
        for item_data in return_data.items:
            return_item = ReturnItem(
                return_id=sale_return.return_id,
                sale_item_id=item_data.sale_item_id,
                brand_id=item_data.brand_id,
                brand_name=item_data.brand_name,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_amount=item_data.total_amount
            )
            db.add(return_item)
        
        db.commit()
        db.refresh(sale_return)
        return sale_return
    
    def get_by_id(self, db: Session, return_id: int) -> Optional[SaleReturn]:
        return db.query(SaleReturn).filter(SaleReturn.return_id == return_id).first()
    
    def get_by_sale(self, db: Session, sale_id: int) -> List[SaleReturn]:
        return db.query(SaleReturn).filter(SaleReturn.sale_id == sale_id).all()
    
    def list_returns(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[SaleStatus] = None
    ) -> List[SaleReturn]:
        query = db.query(SaleReturn)
        
        if status:
            query = query.filter(SaleReturn.status == status)
        
        return query.order_by(desc(SaleReturn.created_at)).offset(skip).limit(limit).all()
    
    def update_status(self, db: Session, return_id: int, status: SaleStatus) -> Optional[SaleReturn]:
        sale_return = self.get_by_id(db, return_id)
        if sale_return:
            sale_return.status = status
            if status == SaleStatus.COMPLETED:
                sale_return.processed_at = datetime.now()
            db.commit()
            db.refresh(sale_return)
        return sale_return
