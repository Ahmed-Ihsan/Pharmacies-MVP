from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.dosage_form import DosageForm
from app.repositories.base import BaseRepository
from app.schemas.dosage_form import DosageFormCreate, DosageFormUpdate


class DosageFormRepository(
    BaseRepository[DosageForm, DosageFormCreate, DosageFormUpdate]
):
    def __init__(self):
        super().__init__(DosageForm)

    def get_by_code(self, db: Session, form_code: str) -> Optional[DosageForm]:
        return db.query(DosageForm).filter(DosageForm.form_code == form_code).first()

    def get_by_name(self, db: Session, form_name: str) -> Optional[DosageForm]:
        return db.query(DosageForm).filter(DosageForm.form_name == form_name).first()

    def search(
        self, db: Session, query: str, skip: int = 0, limit: int = 100
    ) -> List[DosageForm]:
        search_filter = or_(
            DosageForm.form_name.ilike(f"%{query}%"),
            DosageForm.form_code.ilike(f"%{query}%"),
        )
        return (
            db.query(DosageForm).filter(search_filter).offset(skip).limit(limit).all()
        )

    def get_search_count(self, db: Session, query: str) -> int:
        search_filter = or_(
            DosageForm.form_name.ilike(f"%{query}%"),
            DosageForm.form_code.ilike(f"%{query}%"),
        )
        return db.query(func.count(DosageForm.form_id)).filter(search_filter).scalar()


dosage_form_repository = DosageFormRepository()
