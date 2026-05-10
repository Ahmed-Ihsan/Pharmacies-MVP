from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from app.core.constants import PaymentMethod, SaleStatus, DiscountType


class SaleItemBase(BaseModel):
    brand_id: int
    brand_name: Optional[str] = None
    generic_name: Optional[str] = None
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = Field(ge=0, default=None)
    discount_amount: Decimal = Field(ge=0, default=0)
    subtotal: Decimal = Field(ge=0)
    total: Decimal = Field(ge=0)
    
    @validator('subtotal')
    def calculate_subtotal(cls, v, values):
        quantity = values.get('quantity', 0)
        unit_price = values.get('unit_price', 0)
        return quantity * unit_price
    
    @validator('total')
    def calculate_total(cls, v, values):
        subtotal = values.get('subtotal', 0)
        discount_amount = values.get('discount_amount', 0)
        return subtotal - discount_amount


class SaleItemCreate(SaleItemBase):
    pass


class SaleItemUpdate(BaseModel):
    quantity: Optional[int] = Field(gt=0, default=None)
    unit_price: Optional[Decimal] = Field(ge=0, default=None)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = Field(ge=0, default=None)


class SaleItem(SaleItemBase):
    item_id: int
    sale_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    payment_method: PaymentMethod
    amount: Decimal = Field(gt=0)
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class Payment(PaymentBase):
    payment_id: int
    sale_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class SaleBase(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    subtotal: Decimal = Field(ge=0)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = Field(ge=0, default=None)
    discount_amount: Decimal = Field(ge=0, default=0)
    tax_amount: Decimal = Field(ge=0, default=0)
    total_amount: Decimal = Field(ge=0)
    paid_amount: Decimal = Field(ge=0, default=0)
    change_amount: Decimal = Field(ge=0, default=0)
    status: SaleStatus = SaleStatus.PENDING
    notes: Optional[str] = None


class SaleCreate(SaleBase):
    items: List[SaleItemCreate]
    payments: List[PaymentCreate] = []
    
    @validator('total_amount')
    def calculate_total_amount(cls, v, values):
        subtotal = values.get('subtotal', 0)
        discount_amount = values.get('discount_amount', 0)
        tax_amount = values.get('tax_amount', 0)
        return subtotal - discount_amount + tax_amount


class SaleUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = Field(ge=0, default=None)
    discount_amount: Optional[Decimal] = Field(ge=0, default=None)
    status: Optional[SaleStatus] = None
    notes: Optional[str] = None


class Sale(SaleBase):
    sale_id: int
    invoice_number: str
    items: List[SaleItem] = []
    payments: List[Payment] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SaleWithDetails(Sale):
    pass


class ReturnItemBase(BaseModel):
    sale_item_id: int
    brand_id: int
    brand_name: Optional[str] = None
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    total_amount: Decimal = Field(ge=0)


class ReturnItemCreate(ReturnItemBase):
    pass


class ReturnItem(ReturnItemBase):
    return_item_id: int
    return_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class SaleReturnBase(BaseModel):
    sale_id: int
    reason: str
    total_amount: Decimal = Field(ge=0)
    refund_amount: Decimal = Field(ge=0)
    status: SaleStatus = SaleStatus.PENDING
    notes: Optional[str] = None


class SaleReturnCreate(SaleReturnBase):
    items: List[ReturnItemCreate]


class SaleReturn(SaleReturnBase):
    return_id: int
    return_number: str
    items: List[ReturnItem] = []
    created_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
