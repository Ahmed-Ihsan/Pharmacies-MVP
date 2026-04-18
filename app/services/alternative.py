from typing import List
from sqlalchemy.orm import Session
from app.models.alternative import GenericAlternative
from app.repositories.alternative import alternative_repository
from app.schemas.alternative import (
    GenericAlternativeCreate,
    GenericAlternativeUpdate,
    GenericAlternativeWithNames,
)
from app.core.exceptions import DuplicateException, NotFoundException


class AlternativeService:
    def __init__(self):
        self.repo = alternative_repository

    def get(self, db: Session, alternative_id: int) -> GenericAlternative:
        obj = self.repo.get(db, alternative_id)
        if not obj:
            raise NotFoundException("GenericAlternative", str(alternative_id))
        return obj

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[GenericAlternative]:
        return self.repo.get_multi(db, skip=skip, limit=limit)

    def get_with_details(
        self, db: Session, alternative_id: int
    ) -> GenericAlternativeWithNames:
        obj = self.repo.get_with_details(db, alternative_id)
        if not obj:
            raise NotFoundException("GenericAlternative", str(alternative_id))
        return GenericAlternativeWithNames.model_validate(obj)

    def get_by_primary_generic(
        self, db: Session, primary_generic_id: int
    ) -> List[GenericAlternative]:
        return self.repo.get_by_primary_generic(db, primary_generic_id)

    def get_count_by_primary_generic(self, db: Session, primary_generic_id: int) -> int:
        return self.repo.get_count_by_primary_generic(db, primary_generic_id)

    def get_alternatives_for_generic(
        self, db: Session, generic_id: int
    ) -> List[GenericAlternativeWithNames]:
        alternatives = self.repo.get_by_primary_generic(db, generic_id)
        return [GenericAlternativeWithNames.model_validate(alt) for alt in alternatives]

    def create(
        self, db: Session, obj_in: GenericAlternativeCreate
    ) -> GenericAlternative:
        # Check if this pair already exists
        existing = self.repo.get_alternative_pair(
            db, obj_in.primary_generic_id, obj_in.alternative_generic_id
        )
        if existing:
            raise DuplicateException(
                "GenericAlternative",
                "pair",
                f"{obj_in.primary_generic_id}->{obj_in.alternative_generic_id}",
            )

        return self.repo.create(db, obj_in=obj_in)

    def update(
        self, db: Session, alternative_id: int, obj_in: GenericAlternativeUpdate
    ) -> GenericAlternative:
        db_obj = self.get(db, alternative_id)
        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, alternative_id: int) -> GenericAlternative:
        db_obj = self.get(db, alternative_id)
        return self.repo.remove(db, id=alternative_id)


alternative_service = AlternativeService()
