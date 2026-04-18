from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class TherapeuticClass(Base):
    __tablename__ = "therapeutic_classes"
    
    class_id = Column(Integer, primary_key=True, index=True)
    class_code = Column(String(20), unique=True, nullable=False, index=True)
    class_name = Column(String(255), nullable=False)
    parent_class_id = Column(Integer, ForeignKey("therapeutic_classes.class_id"), nullable=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Self-referential relationship for hierarchy
    parent = relationship("TherapeuticClass", remote_side=[class_id], backref="children")
    
    # Relationship to generic drugs
    generic_drugs = relationship("GenericDrug", back_populates="therapeutic_class")
    
    def __repr__(self):
        return f"<TherapeuticClass(class_code='{self.class_code}', class_name='{self.class_name}')>"
