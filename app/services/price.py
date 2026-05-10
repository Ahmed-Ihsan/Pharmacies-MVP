from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.price import DrugPrice
from app.repositories.price import price_repository
from app.schemas.price import DrugPriceCreate, DrugPriceUpdate, DrugPriceWithBrand
from app.core.exceptions import NotFoundException


class PriceService:
    def __init__(self):
        self.repo = price_repository

    def get(self, db: Session, price_id: int) -> DrugPrice:
        obj = self.repo.get(db, price_id)
        if not obj:
            raise NotFoundException("DrugPrice", str(price_id))
        return obj

    def get_with_brand(self, db: Session, price_id: int) -> DrugPriceWithBrand:
        obj = self.repo.get_with_brand(db, price_id)
        if not obj:
            raise NotFoundException("DrugPrice", str(price_id))
        return DrugPriceWithBrand.model_validate(obj)

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[DrugPrice]:
        return self.repo.get_multi(db, skip=skip, limit=limit)

    def get_by_brand(
        self, db: Session, brand_id: int, skip: int = 0, limit: int = 100
    ) -> List[DrugPrice]:
        return self.repo.get_by_brand(db, brand_id=brand_id, skip=skip, limit=limit)

    def get_count_by_brand(self, db: Session, brand_id: int) -> int:
        return self.repo.get_count_by_brand(db, brand_id=brand_id)

    def get_active_price(
        self, db: Session, brand_id: int, as_of_date: date = None
    ) -> Optional[DrugPrice]:
        return self.repo.get_active_price(db, brand_id=brand_id, as_of_date=as_of_date)

    def create(self, db: Session, obj_in: DrugPriceCreate) -> DrugPrice:
        return self.repo.create(db, obj_in=obj_in)

    def update(self, db: Session, price_id: int, obj_in: DrugPriceUpdate) -> DrugPrice:
        db_obj = self.get(db, price_id)
        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, price_id: int) -> DrugPrice:
        db_obj = self.get(db, price_id)
        return self.repo.remove(db, id=price_id)


price_service = PriceService()
