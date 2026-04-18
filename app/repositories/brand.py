from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from app.models.brand import BrandName
from app.repositories.base import BaseRepository
from app.schemas.brand import BrandNameCreate, BrandNameUpdate


class BrandRepository(BaseRepository[BrandName, BrandNameCreate, BrandNameUpdate]):
    def __init__(self):
        super().__init__(BrandName)

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        return (
            db.query(BrandName)
            .options(
                joinedload(BrandName.generic_drug),
                joinedload(BrandName.manufacturer),
                joinedload(BrandName.dosage_form),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_ndc(self, db: Session, ndc_number: str) -> Optional[BrandName]:
        return db.query(BrandName).filter(BrandName.ndc_number == ndc_number).first()

    def get_by_barcode(self, db: Session, barcode: str) -> Optional[BrandName]:
        return db.query(BrandName).filter(BrandName.barcode == barcode).first()

    def get_by_name(self, db: Session, brand_name: str) -> Optional[BrandName]:
        return db.query(BrandName).filter(BrandName.brand_name == brand_name).first()

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        search_filter = or_(
            BrandName.brand_name.ilike(f"%{query}%"),
            BrandName.ndc_number.ilike(f"%{query}%"),
            BrandName.barcode.ilike(f"%{query}%"),
        )
        return (
            db.query(BrandName)
            .options(
                joinedload(BrandName.generic_drug),
                joinedload(BrandName.manufacturer),
                joinedload(BrandName.dosage_form),
            )
            .filter(search_filter)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_search_count(self, db: Session, query: str) -> int:
        search_filter = or_(
            BrandName.brand_name.ilike(f"%{query}%"),
            BrandName.ndc_number.ilike(f"%{query}%"),
            BrandName.barcode.ilike(f"%{query}%"),
        )
        return db.query(func.count(BrandName.brand_id)).filter(search_filter).scalar()

    def get_by_generic(
        self, db: Session, generic_id: int, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        return (
            db.query(BrandName)
            .filter(BrandName.generic_id == generic_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_manufacturer(
        self, db: Session, manufacturer_id: int, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        return (
            db.query(BrandName)
            .filter(BrandName.manufacturer_id == manufacturer_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_count_by_manufacturer(self, db: Session, manufacturer_id: int) -> int:
        return (
            db.query(func.count(BrandName.brand_id))
            .filter(BrandName.manufacturer_id == manufacturer_id)
            .scalar()
        )

    def get_with_details(self, db: Session, brand_id: int) -> Optional[BrandName]:
        return (
            db.query(BrandName)
            .options(
                joinedload(BrandName.generic_drug),
                joinedload(BrandName.manufacturer),
                joinedload(BrandName.dosage_form),
            )
            .filter(BrandName.brand_id == brand_id)
            .first()
        )

    def get_count_by_generic(self, db: Session, generic_id: int) -> int:
        return (
            db.query(func.count(BrandName.brand_id))
            .filter(BrandName.generic_id == generic_id)
            .scalar()
        )


brand_repository = BrandRepository()
