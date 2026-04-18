from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class DosageForm(Base):
    __tablename__ = "dosage_forms"
    
    dosage_form_id = Column(Integer, primary_key=True, index=True)
    form_code = Column(String(20), unique=True, nullable=False, index=True)
    form_name = Column(String(100), nullable=False)
    form_category = Column(String(50))  # solid, liquid, injectable, etc.
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to brand names
    brand_names = relationship("BrandName", back_populates="dosage_form")
    
    def __repr__(self):
        return f"<DosageForm(form_code='{self.form_code}', form_name='{self.form_name}')>"
