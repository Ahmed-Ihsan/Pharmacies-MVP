from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.therapeutic_class import TherapeuticClass
from app.repositories.base import BaseRepository
from app.schemas.therapeutic_class import TherapeuticClassCreate, TherapeuticClassUpdate


class TherapeuticClassRepository(
    BaseRepository[TherapeuticClass, TherapeuticClassCreate, TherapeuticClassUpdate]
):
    def __init__(self):
        super().__init__(TherapeuticClass)

    def get_by_code(self, db: Session, class_code: str) -> Optional[TherapeuticClass]:
        return (
            db.query(TherapeuticClass)
            .filter(TherapeuticClass.class_code == class_code)
            .first()
        )

    def get_by_name(self, db: Session, class_name: str) -> Optional[TherapeuticClass]:
        return (
            db.query(TherapeuticClass)
            .filter(TherapeuticClass.class_name == class_name)
            .first()
        )

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[TherapeuticClass]:
        search_filter = or_(
            TherapeuticClass.class_name.ilike(f"%{query}%"),
            TherapeuticClass.class_code.ilike(f"%{query}%"),
        )
        return (
            db.query(TherapeuticClass)
            .filter(search_filter)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_search_count(self, db: Session, query: str) -> int:
        search_filter = or_(
            TherapeuticClass.class_name.ilike(f"%{query}%"),
            TherapeuticClass.class_code.ilike(f"%{query}%"),
        )
        return (
            db.query(func.count(TherapeuticClass.class_id))
            .filter(search_filter)
            .scalar()
        )

    def get_roots(self, db: Session) -> List[TherapeuticClass]:
        return (
            db.query(TherapeuticClass)
            .filter(TherapeuticClass.parent_class_id.is_(None))
            .all()
        )

    def get_children(self, db: Session, parent_id: int) -> List[TherapeuticClass]:
        return (
            db.query(TherapeuticClass)
            .filter(TherapeuticClass.parent_class_id == parent_id)
            .all()
        )


therapeutic_class_repository = TherapeuticClassRepository()
