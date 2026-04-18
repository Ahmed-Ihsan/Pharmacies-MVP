from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.price import DrugPrice
from app.repositories.base import BaseRepository
from app.schemas.price import DrugPriceCreate, DrugPriceUpdate


class PriceRepository(BaseRepository[DrugPrice, DrugPriceCreate, DrugPriceUpdate]):
    def __init__(self):
        super().__init__(DrugPrice)

    def get_by_brand(
        self, db: Session, brand_id: int, skip: int = 0, limit: int = 100
    ) -> List[DrugPrice]:
        return (
            db.query(DrugPrice)
            .filter(DrugPrice.brand_id == brand_id)
            .order_by(DrugPrice.effective_date.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_count_by_brand(self, db: Session, brand_id: int) -> int:
        return (
            db.query(func.count(DrugPrice.price_id))
            .filter(DrugPrice.brand_id == brand_id)
            .scalar()
        )

    def get_active_price(
        self, db: Session, brand_id: int, as_of_date: date = None
    ) -> Optional[DrugPrice]:
        if as_of_date is None:
            as_of_date = date.today()
        return (
            db.query(DrugPrice)
            .filter(
                DrugPrice.brand_id == brand_id, DrugPrice.effective_date <= as_of_date
            )
            .order_by(DrugPrice.effective_date.desc())
            .first()
        )

    def get_with_brand(self, db: Session, price_id: int) -> Optional[DrugPrice]:
        return (
            db.query(DrugPrice)
            .options(joinedload(DrugPrice.brand_name))
            .filter(DrugPrice.price_id == price_id)
            .first()
        )


price_repository = PriceRepository()
