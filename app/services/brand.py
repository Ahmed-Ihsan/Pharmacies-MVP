from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.brand import BrandName
from app.repositories.brand import brand_repository
from app.schemas.brand import BrandNameCreate, BrandNameUpdate, BrandNameWithDetails
from app.core.exceptions import DuplicateException, NotFoundException


class BrandService:
    def __init__(self):
        self.repo = brand_repository

    def get(self, db: Session, brand_id: int) -> BrandName:
        obj = self.repo.get(db, brand_id)
        if not obj:
            raise NotFoundException("BrandName", str(brand_id))
        return obj

    def get_with_details(self, db: Session, brand_id: int) -> BrandNameWithDetails:
        obj = self.repo.get_with_details(db, brand_id)
        if not obj:
            raise NotFoundException("BrandName", str(brand_id))
        return BrandNameWithDetails.model_validate(obj)

    def get_by_ndc(self, db: Session, ndc_number: str) -> Optional[BrandName]:
        return self.repo.get_by_ndc(db, ndc_number)

    def get_by_barcode(self, db: Session, barcode: str) -> Optional[BrandName]:
        return self.repo.get_by_barcode(db, barcode)

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        return self.repo.get_multi(db, skip=skip, limit=limit)

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        return self.repo.search(db, query=query, skip=skip, limit=limit)

    def get_search_count(self, db: Session, query: str) -> int:
        return self.repo.get_search_count(db, query=query)

    def get_by_generic(
        self, db: Session, generic_id: int, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        return self.repo.get_by_generic(
            db, generic_id=generic_id, skip=skip, limit=limit
        )

    def get_count_by_generic(self, db: Session, generic_id: int) -> int:
        return self.repo.get_count_by_generic(db, generic_id=generic_id)

    def get_by_manufacturer(
        self, db: Session, manufacturer_id: int, skip: int = 0, limit: int = 100
    ) -> List[BrandName]:
        return self.repo.get_by_manufacturer(
            db, manufacturer_id=manufacturer_id, skip=skip, limit=limit
        )

    def get_count_by_manufacturer(self, db: Session, manufacturer_id: int) -> int:
        return self.repo.get_count_by_manufacturer(db, manufacturer_id=manufacturer_id)

    def create(self, db: Session, obj_in: BrandNameCreate) -> BrandName:
        if obj_in.ndc_number:
            existing = self.repo.get_by_ndc(db, obj_in.ndc_number)
            if existing:
                raise DuplicateException("BrandName", "ndc_number", obj_in.ndc_number)

        if obj_in.barcode:
            existing = self.repo.get_by_barcode(db, obj_in.barcode)
            if existing:
                raise DuplicateException("BrandName", "barcode", obj_in.barcode)

        return self.repo.create(db, obj_in=obj_in)

    def update(self, db: Session, brand_id: int, obj_in: BrandNameUpdate) -> BrandName:
        db_obj = self.get(db, brand_id)

        if obj_in.ndc_number is not None:
            existing = self.repo.get_by_ndc(db, obj_in.ndc_number)
            if existing and existing.brand_id != brand_id:
                raise DuplicateException("BrandName", "ndc_number", obj_in.ndc_number)

        if obj_in.barcode is not None:
            existing = self.repo.get_by_barcode(db, obj_in.barcode)
            if existing and existing.brand_id != brand_id:
                raise DuplicateException("BrandName", "barcode", obj_in.barcode)

        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, brand_id: int) -> BrandName:
        db_obj = self.get(db, brand_id)
        return self.repo.remove(db, id=brand_id)


brand_service = BrandService()
