from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.constants import GenericStatus, PregnancyCategory, ControlledSubstanceSchedule


class GenericDrug(Base):
    __tablename__ = "generic_drugs"
    
    generic_id = Column(Integer, primary_key=True, index=True)
    generic_name = Column(String(255), nullable=False, index=True)
    chemical_name = Column(String(500))
    molecular_formula = Column(String(100))
    cas_number = Column(String(20), unique=True, index=True)  # Chemical Abstracts Service
    therapeutic_class_id = Column(Integer, ForeignKey("therapeutic_classes.class_id"))
    pharmacology = Column(Text)
    indications = Column(Text)
    contraindications = Column(Text)
    side_effects = Column(Text)
    interactions = Column(Text)
    pregnancy_category = Column(Enum(PregnancyCategory))
    controlled_substance_schedule = Column(Enum(ControlledSubstanceSchedule), default=ControlledSubstanceSchedule.NONE)
    status = Column(Enum(GenericStatus), default=GenericStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    therapeutic_class = relationship("TherapeuticClass", back_populates="generic_drugs")
    brand_names = relationship("BrandName", back_populates="generic_drug")
    primary_alternatives = relationship("GenericAlternative", foreign_keys="GenericAlternative.primary_generic_id", back_populates="primary_generic")
    alternative_to = relationship("GenericAlternative", foreign_keys="GenericAlternative.alternative_generic_id", back_populates="alternative_generic")
    
    def __repr__(self):
        return f"<GenericDrug(generic_name='{self.generic_name}', cas_number='{self.cas_number}')>"
