from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app.models.generic import GenericDrug
from app.repositories.base import BaseRepository
from app.schemas.generic import GenericDrugCreate, GenericDrugUpdate


class GenericRepository(
    BaseRepository[GenericDrug, GenericDrugCreate, GenericDrugUpdate]
):
    def __init__(self):
        super().__init__(GenericDrug)

    def get_by_cas_number(self, db: Session, cas_number: str) -> Optional[GenericDrug]:
        return (
            db.query(GenericDrug).filter(GenericDrug.cas_number == cas_number).first()
        )

    def get_by_name(self, db: Session, generic_name: str) -> Optional[GenericDrug]:
        return (
            db.query(GenericDrug)
            .filter(GenericDrug.generic_name == generic_name)
            .first()
        )

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[GenericDrug]:
        search_filter = or_(
            GenericDrug.generic_name.ilike(f"%{query}%"),
            GenericDrug.chemical_name.ilike(f"%{query}%"),
            GenericDrug.cas_number.ilike(f"%{query}%"),
        )
        return (
            db.query(GenericDrug).filter(search_filter).offset(skip).limit(limit).all()
        )

    def get_search_count(self, db: Session, query: str) -> int:
        search_filter = or_(
            GenericDrug.generic_name.ilike(f"%{query}%"),
            GenericDrug.chemical_name.ilike(f"%{query}%"),
            GenericDrug.cas_number.ilike(f"%{query}%"),
        )
        return (
            db.query(func.count(GenericDrug.generic_id)).filter(search_filter).scalar()
        )

    def get_with_therapeutic_class(
        self, db: Session, generic_id: int
    ) -> Optional[GenericDrug]:
        return (
            db.query(GenericDrug)
            .options(joinedload(GenericDrug.therapeutic_class))
            .filter(GenericDrug.generic_id == generic_id)
            .first()
        )

    def get_by_therapeutic_class(
        self, db: Session, class_id: int, skip: int = 0, limit: int = 100
    ) -> List[GenericDrug]:
        return (
            db.query(GenericDrug)
            .filter(GenericDrug.therapeutic_class_id == class_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_count_by_class(self, db: Session, class_id: int) -> int:
        return (
            db.query(func.count(GenericDrug.generic_id))
            .filter(GenericDrug.therapeutic_class_id == class_id)
            .scalar()
        )


generic_repository = GenericRepository()
