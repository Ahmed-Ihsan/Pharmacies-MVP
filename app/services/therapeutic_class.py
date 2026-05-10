from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.therapeutic_class import TherapeuticClass
from app.repositories.therapeutic_class import therapeutic_class_repository
from app.schemas.therapeutic_class import TherapeuticClassCreate, TherapeuticClassUpdate
from app.core.exceptions import DuplicateException, NotFoundException
from app.utils.code_generator import code_generator


class TherapeuticClassService:
    def __init__(self):
        self.repo = therapeutic_class_repository

    def get(self, db: Session, class_id: int) -> TherapeuticClass:
        obj = self.repo.get(db, class_id)
        if not obj:
            raise NotFoundException("TherapeuticClass", str(class_id))
        return obj

    def get_by_code(self, db: Session, class_code: str) -> Optional[TherapeuticClass]:
        return self.repo.get_by_code(db, class_code)

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[TherapeuticClass]:
        return self.repo.get_multi(db, skip=skip, limit=limit)

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[TherapeuticClass]:
        return self.repo.search(db, query=query, skip=skip, limit=limit)

    def get_search_count(self, db: Session, query: str) -> int:
        return self.repo.get_search_count(db, query=query)

    def get_roots(self, db: Session) -> List[TherapeuticClass]:
        return self.repo.get_roots(db)

    def get_children(self, db: Session, parent_id: int) -> List[TherapeuticClass]:
        return self.repo.get_children(db, parent_id)

    def create(self, db: Session, obj_in: TherapeuticClassCreate) -> TherapeuticClass:
        # Auto-generate class_code if not provided
        if not obj_in.class_code:
            parent_code = None
            if obj_in.parent_class_id:
                parent = self.repo.get(db, obj_in.parent_class_id)
                parent_code = parent.class_code if parent else None
            obj_in.class_code = code_generator.generate_class_code(parent_code)
        
        # Check for duplicate code
        existing = self.repo.get_by_code(db, obj_in.class_code)
        if existing:
            # If duplicate, generate new code
            parent_code = None
            if obj_in.parent_class_id:
                parent = self.repo.get(db, obj_in.parent_class_id)
                parent_code = parent.class_code if parent else None
            obj_in.class_code = code_generator.generate_class_code(parent_code)

        # Check for duplicate name
        existing = self.repo.get_by_name(db, obj_in.class_name)
        if existing:
            raise DuplicateException(
                "TherapeuticClass", "class_name", obj_in.class_name
            )

        return self.repo.create(db, obj_in=obj_in)

    def update(
        self, db: Session, class_id: int, obj_in: TherapeuticClassUpdate
    ) -> TherapeuticClass:
        db_obj = self.get(db, class_id)

        if obj_in.class_code is not None:
            existing = self.repo.get_by_code(db, obj_in.class_code)
            if existing and existing.class_id != class_id:
                raise DuplicateException(
                    "TherapeuticClass", "class_code", obj_in.class_code
                )

        if obj_in.class_name is not None:
            existing = self.repo.get_by_name(db, obj_in.class_name)
            if existing and existing.class_id != class_id:
                raise DuplicateException(
                    "TherapeuticClass", "class_name", obj_in.class_name
                )

        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, class_id: int) -> TherapeuticClass:
        db_obj = self.get(db, class_id)
        return self.repo.remove(db, id=class_id)


therapeutic_class_service = TherapeuticClassService()
