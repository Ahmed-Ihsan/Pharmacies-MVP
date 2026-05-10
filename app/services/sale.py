from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from app.repositories.sale import SaleRepository, SaleItemRepository, PaymentRepository, SaleReturnRepository
from app.repositories.inventory import InventoryRepository
from app.schemas.sale import SaleCreate, SaleUpdate, SaleReturnCreate, SaleWithDetails
from app.models.sale import Sale, SaleItem, Payment, SaleReturn
from app.core.constants import SaleStatus, DiscountType
from app.core.exceptions import NotFoundException, ValidationException


class SaleService:
    def __init__(self):
        self.sale_repo = SaleRepository()
        self.sale_item_repo = SaleItemRepository()
        self.payment_repo = PaymentRepository()
        self.return_repo = SaleReturnRepository()
        self.inventory_repo = InventoryRepository()
    
    def create_sale(self, db: Session, sale_data: SaleCreate) -> SaleWithDetails:
        """Create a new sale with inventory updates."""
        # Generate invoice number
        invoice_number = self.sale_repo.generate_invoice_number(db)
        
        # Calculate totals
        subtotal = sum(item.subtotal for item in sale_data.items)
        discount_amount = sale_data.discount_amount
        total_amount = subtotal - discount_amount + sale_data.tax_amount
        
        # Create sale
        sale_dict = sale_data.model_dump(exclude={'items', 'payments'})
        sale_dict['invoice_number'] = invoice_number
        sale_dict['subtotal'] = subtotal
        sale_dict['total_amount'] = total_amount
        
        sale = Sale(**sale_dict)
        db.add(sale)
        db.flush()
        
        # Create sale items and update inventory
        for item_data in sale_data.items:
            # Get brand name and generic name for denormalization
            from app.models.brand import BrandName
            from app.models.generic import GenericDrug
            brand = db.query(BrandName).filter(BrandName.brand_id == item_data.brand_id).first()
            
            item_dict = item_data.model_dump()
            item_dict['sale_id'] = sale.sale_id
            if brand:
                item_dict['brand_name'] = brand.brand_name
                generic = db.query(GenericDrug).filter(GenericDrug.generic_id == brand.generic_id).first()
                if generic:
                    item_dict['generic_name'] = generic.generic_name
            
            sale_item = SaleItem(**item_dict)
            db.add(sale_item)
            
            # Update inventory
            inventory = self.inventory_repo.get_by_brand(db, item_data.brand_id)
            if inventory:
                if inventory.current_quantity < item_data.quantity:
                    raise ValidationException(f"Insufficient stock for {brand.brand_name if brand else 'item'}")
                inventory.current_quantity -= item_data.quantity
                # Update status
                if inventory.current_quantity <= 0:
                    inventory.status = "out_of_stock"
                elif inventory.current_quantity <= inventory.minimum_quantity:
                    inventory.status = "low_stock"
                else:
                    inventory.status = "available"
        
        # Create payments
        for payment_data in sale_data.payments:
            payment_dict = payment_data.model_dump()
            payment_dict['sale_id'] = sale.sale_id
            payment = Payment(**payment_dict)
            db.add(payment)
        
        # Update paid amount and change
        total_paid = sum(p.amount for p in sale_data.payments)
        sale.paid_amount = total_paid
        sale.change_amount = total_paid - total_amount
        
        # Complete sale if fully paid
        if total_paid >= total_amount:
            sale.status = SaleStatus.COMPLETED
            sale.completed_at = datetime.now()
        
        db.commit()
        db.refresh(sale)
        
        return self.get_sale_with_details(db, sale.sale_id)
    
    def get_sale(self, db: Session, sale_id: int) -> Sale:
        sale = self.sale_repo.get(db, sale_id)
        if not sale:
            raise NotFoundException(f"Sale with id {sale_id} not found")
        return sale
    
    def get_by_invoice_number(self, db: Session, invoice_number: str) -> Sale:
        sale = self.sale_repo.get_by_invoice_number(db, invoice_number)
        if not sale:
            raise NotFoundException(f"Sale with invoice number {invoice_number} not found")
        return sale
    
    def get_sale_with_details(self, db: Session, sale_id: int) -> SaleWithDetails:
        sale = self.sale_repo.get_with_details(db, sale_id)
        if not sale:
            raise NotFoundException(f"Sale with id {sale_id} not found")
        
        # Load items and payments
        items = self.sale_item_repo.get_by_sale(db, sale_id)
        payments = self.payment_repo.get_by_sale(db, sale_id)
        
        # Convert to dict for manual serialization
        sale_dict = {
            "sale_id": sale.sale_id,
            "invoice_number": sale.invoice_number,
            "customer_name": sale.customer_name,
            "customer_phone": sale.customer_phone,
            "subtotal": float(sale.subtotal),
            "discount_type": sale.discount_type.value if sale.discount_type else None,
            "discount_value": float(sale.discount_value) if sale.discount_value else None,
            "discount_amount": float(sale.discount_amount),
            "tax_amount": float(sale.tax_amount),
            "total_amount": float(sale.total_amount),
            "paid_amount": float(sale.paid_amount),
            "change_amount": float(sale.change_amount),
            "status": sale.status.value,
            "notes": sale.notes,
            "items": [
                {
                    "item_id": item.item_id,
                    "sale_id": item.sale_id,
                    "brand_id": item.brand_id,
                    "brand_name": item.brand_name,
                    "generic_name": item.generic_name,
                    "quantity": item.quantity,
                    "unit_price": float(item.unit_price),
                    "discount_type": item.discount_type.value if item.discount_type else None,
                    "discount_value": float(item.discount_value) if item.discount_value else None,
                    "discount_amount": float(item.discount_amount),
                    "subtotal": float(item.subtotal),
                    "total": float(item.total),
                    "created_at": item.created_at.isoformat() if item.created_at else None
                }
                for item in items
            ],
            "payments": [
                {
                    "payment_id": payment.payment_id,
                    "sale_id": payment.sale_id,
                    "payment_method": payment.payment_method.value,
                    "amount": float(payment.amount),
                    "reference_number": payment.reference_number,
                    "notes": payment.notes,
                    "created_at": payment.created_at.isoformat() if payment.created_at else None
                }
                for payment in payments
            ],
            "created_at": sale.created_at.isoformat() if sale.created_at else None,
            "updated_at": sale.updated_at.isoformat() if sale.updated_at else None,
            "completed_at": sale.completed_at.isoformat() if sale.completed_at else None
        }
        
        return sale_dict
    
    def list_sales(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[SaleStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Sale]:
        return self.sale_repo.list_sales(db, skip, limit, status, start_date, end_date)
    
    def update_sale(self, db: Session, sale_id: int, sale_data: SaleUpdate) -> Sale:
        sale = self.get_sale(db, sale_id)
        
        update_data = sale_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(sale, field, value)
        
        db.commit()
        db.refresh(sale)
        return sale
    
    def cancel_sale(self, db: Session, sale_id: int) -> Sale:
        """Cancel a sale and restore inventory."""
        sale = self.get_sale(db, sale_id)
        
        if sale.status == SaleStatus.CANCELLED:
            raise ValidationException("Sale is already cancelled")
        
        # Restore inventory
        items = self.sale_item_repo.get_by_sale(db, sale_id)
        for item in items:
            inventory = self.inventory_repo.get_by_brand(db, item.brand_id)
            if inventory:
                inventory.current_quantity += item.quantity
                # Update status
                if inventory.current_quantity <= 0:
                    inventory.status = "out_of_stock"
                elif inventory.current_quantity <= inventory.minimum_quantity:
                    inventory.status = "low_stock"
                else:
                    inventory.status = "available"
        
        sale.status = SaleStatus.CANCELLED
        db.commit()
        db.refresh(sale)
        return sale
    
    def process_return(self, db: Session, return_data: SaleReturnCreate) -> SaleReturn:
        """Process a sale return with inventory restoration."""
        # Validate sale exists
        sale = self.get_sale(db, return_data.sale_id)
        if sale.status == SaleStatus.CANCELLED:
            raise ValidationException("Cannot return a cancelled sale")
        
        # Create return
        sale_return = self.return_repo.create(db, return_data)
        
        # Restore inventory for returned items
        for item_data in return_data.items:
            inventory = self.inventory_repo.get_by_brand(db, item_data.brand_id)
            if inventory:
                inventory.current_quantity += item_data.quantity
                # Update status
                if inventory.current_quantity <= 0:
                    inventory.status = "out_of_stock"
                elif inventory.current_quantity <= inventory.minimum_quantity:
                    inventory.status = "low_stock"
                else:
                    inventory.status = "available"
        
        # Update sale status
        sale.status = SaleStatus.REFUNDED
        
        db.commit()
        db.refresh(sale_return)
        return sale_return
    
    def get_return(self, db: Session, return_id: int) -> SaleReturn:
        sale_return = self.return_repo.get_by_id(db, return_id)
        if not sale_return:
            raise NotFoundException(f"Return with id {return_id} not found")
        return sale_return
    
    def list_returns(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: Optional[SaleStatus] = None
    ) -> List[SaleReturn]:
        return self.return_repo.list_returns(db, skip, limit, status)
