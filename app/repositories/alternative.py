from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.alternative import GenericAlternative
from app.repositories.base import BaseRepository
from app.schemas.alternative import GenericAlternativeCreate, GenericAlternativeUpdate


class AlternativeRepository(
    BaseRepository[
        GenericAlternative, GenericAlternativeCreate, GenericAlternativeUpdate
    ]
):
    def __init__(self):
        super().__init__(GenericAlternative)

    def get_by_primary_generic(
        self, db: Session, primary_generic_id: int
    ) -> List[GenericAlternative]:
        return (
            db.query(GenericAlternative)
            .options(joinedload(GenericAlternative.alternative_generic))
            .filter(GenericAlternative.primary_generic_id == primary_generic_id)
            .all()
        )

    def get_count_by_primary_generic(self, db: Session, primary_generic_id: int) -> int:
        return (
            db.query(func.count(GenericAlternative.alternative_id))
            .filter(GenericAlternative.primary_generic_id == primary_generic_id)
            .scalar()
        )

    def get_by_alternative_generic(
        self, db: Session, alternative_generic_id: int
    ) -> List[GenericAlternative]:
        return (
            db.query(GenericAlternative)
            .options(joinedload(GenericAlternative.primary_generic))
            .filter(GenericAlternative.alternative_generic_id == alternative_generic_id)
            .all()
        )

    def get_alternative_pair(
        self, db: Session, primary_id: int, alternative_id: int
    ) -> Optional[GenericAlternative]:
        return (
            db.query(GenericAlternative)
            .filter(
                GenericAlternative.primary_generic_id == primary_id,
                GenericAlternative.alternative_generic_id == alternative_id,
            )
            .first()
        )

    def get_with_details(
        self, db: Session, alternative_id: int
    ) -> Optional[GenericAlternative]:
        return (
            db.query(GenericAlternative)
            .options(
                joinedload(GenericAlternative.primary_generic),
                joinedload(GenericAlternative.alternative_generic),
            )
            .filter(GenericAlternative.alternative_id == alternative_id)
            .first()
        )

    def get_multi_with_details(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[GenericAlternative]:
        return (
            db.query(GenericAlternative)
            .options(
                joinedload(GenericAlternative.primary_generic),
                joinedload(GenericAlternative.alternative_generic),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )


alternative_repository = AlternativeRepository()
