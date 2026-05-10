from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Boolean,
    ForeignKey,
    DateTime,
    Enum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.constants import DrugStatus, StorageCondition, RouteOfAdministration


class BrandName(Base):
    __tablename__ = "brand_names"

    brand_id = Column(Integer, primary_key=True, index=True)
    brand_name = Column(String(255), nullable=False, index=True)
    generic_id = Column(
        Integer,
        ForeignKey("generic_drugs.generic_id", ondelete="CASCADE"),
        nullable=False,
    )
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.manufacturer_id"))
    dosage_form_id = Column(Integer, ForeignKey("dosage_forms.dosage_form_id"))
    strength_value = Column(Numeric(10, 4))
    strength_unit = Column(String(20))  # mg, mcg, g, mL, IU, etc.
    package_size = Column(String(50))  # e.g., "30 tablets"
    ndc_number = Column(String(11), unique=True, index=True)  # National Drug Code
    barcode = Column(String(50), index=True)  # UPC/EAN
    atc_code = Column(String(10), index=True)  # Anatomical Therapeutic Chemical code
    prescription_required = Column(Boolean, default=True)
    storage_conditions = Column(
        Enum(StorageCondition), default=StorageCondition.ROOM_TEMPERATURE
    )
    route_of_administration = Column(Enum(RouteOfAdministration))
    status = Column(Enum(DrugStatus), default=DrugStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    generic_drug = relationship("GenericDrug", back_populates="brand_names")
    manufacturer = relationship("Manufacturer", back_populates="brand_names")
    dosage_form = relationship("DosageForm", back_populates="brand_names")
    prices = relationship("DrugPrice", back_populates="brand_name")
    inventory = relationship("Inventory", back_populates="brand", uselist=False)

    def __repr__(self):
        return f"<BrandName(brand_name='{self.brand_name}', ndc='{self.ndc_number}')>"

    @property
    def manufacturer_name(self) -> str | None:
        return self.manufacturer.manufacturer_name if self.manufacturer else None

    @property
    def dosage_form_name(self) -> str | None:
        return self.dosage_form.form_name if self.dosage_form else None

    @property
    def generic_name(self) -> str | None:
        if self.generic_drug:
            # Assuming your generic model uses generic_name or scientific_name
            return getattr(
                self.generic_drug,
                "generic_name",
                getattr(self.generic_drug, "scientific_name", None),
            )
        return None
