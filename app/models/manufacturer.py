from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.constants import ManufacturerStatus


class Manufacturer(Base):
    __tablename__ = "manufacturers"
    
    manufacturer_id = Column(Integer, primary_key=True, index=True)
    manufacturer_name = Column(String(255), nullable=False)
    country_code = Column(String(2))  # ISO country code
    license_number = Column(String(50))
    address = Column(String(500))
    phone = Column(String(50))
    email = Column(String(255))
    status = Column(Enum(ManufacturerStatus), default=ManufacturerStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to brand names
    brand_names = relationship("BrandName", back_populates="manufacturer")
    
    def __repr__(self):
        return f"<Manufacturer(manufacturer_name='{self.manufacturer_name}', status='{self.status}')>"
