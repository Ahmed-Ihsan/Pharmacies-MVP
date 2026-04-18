from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.dosage_form import DosageForm
from app.repositories.dosage_form import dosage_form_repository
from app.schemas.dosage_form import DosageFormCreate, DosageFormUpdate
from app.core.exceptions import DuplicateException, NotFoundException


class DosageFormService:
    def __init__(self):
        self.repo = dosage_form_repository

    def get(self, db: Session, dosage_form_id: int) -> DosageForm:
        obj = self.repo.get(db, dosage_form_id)
        if not obj:
            raise NotFoundException("DosageForm", str(dosage_form_id))
        return obj

    def get_by_code(self, db: Session, form_code: str) -> Optional[DosageForm]:
        return self.repo.get_by_code(db, form_code)

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[DosageForm]:
        return self.repo.get_multi(db, skip=skip, limit=limit)

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[DosageForm]:
        return self.repo.search(db, query=query, skip=skip, limit=limit)

    def get_search_count(self, db: Session, query: str) -> int:
        return self.repo.get_search_count(db, query=query)

    def create(self, db: Session, obj_in: DosageFormCreate) -> DosageForm:
        existing = self.repo.get_by_code(db, obj_in.form_code)
        if existing:
            raise DuplicateException("DosageForm", "form_code", obj_in.form_code)

        existing = self.repo.get_by_name(db, obj_in.form_name)
        if existing:
            raise DuplicateException("DosageForm", "form_name", obj_in.form_name)

        return self.repo.create(db, obj_in=obj_in)

    def update(
        self, db: Session, dosage_form_id: int, obj_in: DosageFormUpdate
    ) -> DosageForm:
        db_obj = self.get(db, dosage_form_id)

        if obj_in.form_code is not None:
            existing = self.repo.get_by_code(db, obj_in.form_code)
            if existing and existing.dosage_form_id != dosage_form_id:
                raise DuplicateException("DosageForm", "form_code", obj_in.form_code)

        if obj_in.form_name is not None:
            existing = self.repo.get_by_name(db, obj_in.form_name)
            if existing and existing.dosage_form_id != dosage_form_id:
                raise DuplicateException("DosageForm", "form_name", obj_in.form_name)

        return self.repo.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, dosage_form_id: int) -> DosageForm:
        db_obj = self.get(db, dosage_form_id)
        return self.repo.remove(db, id=dosage_form_id)


dosage_form_service = DosageFormService()
