from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.constants import PaymentMethod, SaleStatus, DiscountType


class Sale(Base):
    __tablename__ = "sales"
    
    sale_id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    customer_name = Column(String(255))
    customer_phone = Column(String(20))
    subtotal = Column(Numeric(12, 4), nullable=False)
    discount_type = Column(Enum(DiscountType))
    discount_value = Column(Numeric(12, 4))
    discount_amount = Column(Numeric(12, 4), default=0)
    tax_amount = Column(Numeric(12, 4), default=0)
    total_amount = Column(Numeric(12, 4), nullable=False)
    paid_amount = Column(Numeric(12, 4), default=0)
    change_amount = Column(Numeric(12, 4), default=0)
    status = Column(Enum(SaleStatus), default=SaleStatus.PENDING)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="sale", cascade="all, delete-orphan")
    returns = relationship("SaleReturn", back_populates="sale", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Sale(sale_id={self.sale_id}, invoice_number='{self.invoice_number}', total={self.total_amount})>"


class SaleItem(Base):
    __tablename__ = "sale_items"
    
    item_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brand_names.brand_id"), nullable=False)
    brand_name = Column(String(255))  # Denormalized for performance
    generic_name = Column(String(255))  # Denormalized for performance
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 4), nullable=False)
    discount_type = Column(Enum(DiscountType))
    discount_value = Column(Numeric(12, 4))
    discount_amount = Column(Numeric(12, 4), default=0)
    subtotal = Column(Numeric(12, 4), nullable=False)
    total = Column(Numeric(12, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sale = relationship("Sale", back_populates="items")
    brand = relationship("BrandName")
    
    def __repr__(self):
        return f"<SaleItem(item_id={self.item_id}, brand_name='{self.brand_name}', quantity={self.quantity})>"


class Payment(Base):
    __tablename__ = "payments"
    
    payment_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id"), nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    amount = Column(Numeric(12, 4), nullable=False)
    reference_number = Column(String(100))  # Card number, transfer reference, etc.
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sale = relationship("Sale", back_populates="payments")
    
    def __repr__(self):
        return f"<Payment(payment_id={self.payment_id}, method={self.payment_method}, amount={self.amount})>"


class SaleReturn(Base):
    __tablename__ = "sale_returns"
    
    return_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id"), nullable=False)
    return_number = Column(String(50), unique=True, nullable=False, index=True)
    reason = Column(Text, nullable=False)
    total_amount = Column(Numeric(12, 4), nullable=False)
    refund_amount = Column(Numeric(12, 4), nullable=False)
    status = Column(Enum(SaleStatus), default=SaleStatus.PENDING)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Relationships
    sale = relationship("Sale", back_populates="returns")
    items = relationship("ReturnItem", back_populates="sale_return", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<SaleReturn(return_id={self.return_id}, return_number='{self.return_number}', amount={self.refund_amount})>"


class ReturnItem(Base):
    __tablename__ = "return_items"
    
    return_item_id = Column(Integer, primary_key=True, index=True)
    return_id = Column(Integer, ForeignKey("sale_returns.return_id"), nullable=False)
    sale_item_id = Column(Integer, ForeignKey("sale_items.item_id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brand_names.brand_id"), nullable=False)
    brand_name = Column(String(255))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 4), nullable=False)
    total_amount = Column(Numeric(12, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sale_return = relationship("SaleReturn", back_populates="items")
    brand = relationship("BrandName")
    
    def __repr__(self):
        return f"<ReturnItem(return_item_id={self.return_item_id}, brand_name='{self.brand_name}', quantity={self.quantity})>"
