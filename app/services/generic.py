from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.generic import GenericDrug
from app.repositories.generic import generic_repository
from app.repositories.brand import brand_repository
from app.schemas.generic import (
    GenericDrugCreate,
    GenericDrugUpdate,
    GenericDrugWithDetails,
)
from app.core.exceptions import DuplicateException, NotFoundException
from app.utils.code_generator import code_generator


class GenericService:
    def __init__(self):
        self.repo = generic_repository

    def get(self, db: Session, generic_id: int) -> GenericDrug:
        obj = self.repo.get(db, generic_id)
        if not obj:
            raise NotFoundException("GenericDrug", str(generic_id))
        return obj

    def get_with_details(self, db: Session, generic_id: int) -> GenericDrugWithDetails:
        obj = self.repo.get_with_therapeutic_class(db, generic_id)
        if not obj:
            raise NotFoundException("GenericDrug", str(generic_id))

        brand_count = brand_repository.get_count_by_generic(db, generic_id)

        therapeutic_class_name = None
        if obj.therapeutic_class:
            therapeutic_class_name = obj.therapeutic_class.class_name

        return GenericDrugWithDetails(
            **obj.__dict__,
            brand_count=brand_count,
            therapeutic_class_name=therapeutic_class_name,
        )

    def get_by_cas(self, db: Session, cas_number: str) -> Optional[GenericDrug]:
        return self.repo.get_by_cas_number(db, cas_number)

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[GenericDrug]:
        return self.repo.get_multi(db, skip=skip, limit=limit)

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[GenericDrug]:
        return self.repo.search(db, query=query, skip=skip, limit=limit)

    def get_search_count(self, db: Session, query: str) -> int:
        return self.repo.get_search_count(db, query=query)

    def get_by_therapeutic_class(
        self, db: Session, class_id: int, skip: int = 0, limit: int = 100
    ) -> List[GenericDrug]:
        return self.repo.get_by_therapeutic_class(
            db, class_id=class_id, skip=skip, limit=limit
        )

    def get_count_by_class(self, db: Session, class_id: int) -> int:
        return self.repo.get_count_by_class(db, class_id=class_id)

    def create(self, db: Session, obj_in: GenericDrugCreate) -> GenericDrug:
        # Auto-generate cas_number if not provided
        if not obj_in.cas_number:
            obj_in.cas_number = code_generator.generate_cas_number()
        
        # Check for duplicate cas_number
        if obj_in.cas_number:
            existing = self.repo.get_by_cas_number(db, obj_in.cas_number)
            if existing:
                # If duplicate, generate new code
                obj_in.cas_number = code_generator.generate_cas_number()

        existing = self.repo.get_by_name(db, obj_in.generic_name)
        if existing:
            raise DuplicateException("GenericDrug", "generic_name", obj_in.generic_name)

        return self.repo.create(db, obj_in=obj_in)

    def update(
        self, db: Session, generic_id: int, obj_in: GenericDrugUpdate
    ) -> GenericDrug:
        db_obj = self.get(db, generic_id)

        if obj_in.cas_number is not None:
            existing = self.repo.get_by_cas_number(db, obj_in.cas_number)
            if existing and existing.generic_id != generic_id:
                raise DuplicateException("GenericDrug", "cas_number", obj_in.cas_number)

        if obj_in.generic_name is not None:
            existing = self.repo.get_by_name(db, obj_in.generic_name)
            if existing and existing.generic_id != generic_id:
                raise DuplicateException(
                    "GenericDrug", "generic_name", obj_in.generic_name
                )

        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, generic_id: int) -> GenericDrug:
        db_obj = self.get(db, generic_id)
        return self.repo.remove(db, id=generic_id)


generic_service = GenericService()
