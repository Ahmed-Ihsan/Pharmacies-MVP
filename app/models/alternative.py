from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class GenericAlternative(Base):
    __tablename__ = "generic_alternatives"

    alternative_id = Column(Integer, primary_key=True, index=True)
    primary_generic_id = Column(
        Integer, ForeignKey("generic_drugs.generic_id"), nullable=False
    )
    alternative_generic_id = Column(
        Integer, ForeignKey("generic_drugs.generic_id"), nullable=False
    )
    bioequivalence_status = Column(String(50))  # e.g., "AB-rated"
    notes = Column(String(500))  # Substitution restrictions or notes
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    primary_generic = relationship(
        "GenericDrug",
        foreign_keys=[primary_generic_id],
        back_populates="primary_alternatives",
    )
    alternative_generic = relationship(
        "GenericDrug",
        foreign_keys=[alternative_generic_id],
        back_populates="alternative_to",
    )

    def __repr__(self):
        return f"<GenericAlternative(primary={self.primary_generic_id}, alternative={self.alternative_generic_id})>"

    @property
    def primary_generic_name(self) -> str | None:
        return (
            getattr(
                self.primary_generic,
                "generic_name",
                getattr(self.primary_generic, "scientific_name", None),
            )
            if self.primary_generic
            else None
        )

    @property
    def alternative_generic_name(self) -> str | None:
        return (
            getattr(
                self.alternative_generic,
                "generic_name",
                getattr(self.alternative_generic, "scientific_name", None),
            )
            if self.alternative_generic
            else None
        )
