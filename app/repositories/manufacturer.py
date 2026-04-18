from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.manufacturer import Manufacturer
from app.repositories.base import BaseRepository
from app.schemas.manufacturer import ManufacturerCreate, ManufacturerUpdate


class ManufacturerRepository(
    BaseRepository[Manufacturer, ManufacturerCreate, ManufacturerUpdate]
):
    def __init__(self):
        super().__init__(Manufacturer)

    def get_by_name(self, db: Session, name: str) -> Optional[Manufacturer]:
        return (
            db.query(Manufacturer)
            .filter(Manufacturer.manufacturer_name == name)
            .first()
        )

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[Manufacturer]:
        return (
            db.query(Manufacturer)
            .filter(Manufacturer.manufacturer_name.ilike(f"%{query}%"))
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_search_count(self, db: Session, query: str) -> int:
        return (
            db.query(func.count(Manufacturer.manufacturer_id))
            .filter(Manufacturer.manufacturer_name.ilike(f"%{query}%"))
            .scalar()
        )


manufacturer_repository = ManufacturerRepository()
