from typing import List
from sqlalchemy.orm import Session
from app.models.manufacturer import Manufacturer
from app.repositories.manufacturer import manufacturer_repository
from app.schemas.manufacturer import ManufacturerCreate, ManufacturerUpdate
from app.core.exceptions import NotFoundException


class ManufacturerService:
    def __init__(self):
        self.repo = manufacturer_repository

    def get(self, db: Session, manufacturer_id: int) -> Manufacturer:
        obj = self.repo.get(db, manufacturer_id)
        if not obj:
            raise NotFoundException("Manufacturer", str(manufacturer_id))
        return obj

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[Manufacturer]:
        return self.repo.get_multi(db, skip=skip, limit=limit)

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[Manufacturer]:
        return self.repo.search(db, query=query, skip=skip, limit=limit)

    def get_search_count(self, db: Session, query: str) -> int:
        return self.repo.get_search_count(db, query=query)

    def create(self, db: Session, obj_in: ManufacturerCreate) -> Manufacturer:
        return self.repo.create(db, obj_in=obj_in)

    def update(
        self, db: Session, manufacturer_id: int, obj_in: ManufacturerUpdate
    ) -> Manufacturer:
        db_obj = self.get(db, manufacturer_id)
        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, manufacturer_id: int) -> Manufacturer:
        db_obj = self.get(db, manufacturer_id)
        return self.repo.remove(db, id=manufacturer_id)


manufacturer_service = ManufacturerService()
