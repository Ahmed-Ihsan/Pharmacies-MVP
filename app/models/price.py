from sqlalchemy import Column, Integer, Numeric, Date, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class DrugPrice(Base):
    __tablename__ = "drug_prices"
    
    price_id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brand_names.brand_id"), nullable=False)
    acquisition_price = Column(Numeric(12, 4))  # Cost from supplier
    selling_price = Column(Numeric(12, 4))  # Retail price
    effective_date = Column(Date, nullable=False)  # When price takes effect
    currency = Column(String(3), default="USD")  # ISO currency code
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    brand_name = relationship("BrandName", back_populates="prices")
    
    def __repr__(self):
        return f"<DrugPrice(brand_id={self.brand_id}, selling_price={self.selling_price}, effective={self.effective_date})>"
