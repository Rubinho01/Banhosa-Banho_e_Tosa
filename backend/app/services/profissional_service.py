from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.profissional import Profissional
from app.repositories import profissional_repository
from app.schemas.profissional import ProfissionalCreate


def list_professionals(db: Session) -> list[Profissional]:
    return profissional_repository.list_all(db)


def create_professional(db: Session, payload: ProfissionalCreate) -> Profissional:
    profissional = Profissional(
        name=payload.name,
        role=payload.role,
        specialty=payload.specialty,
        active=payload.active,
    )
    return profissional_repository.create(db, profissional)


def delete_professional(db: Session, profissional_id: str) -> None:
    profissional = profissional_repository.get_by_id(db, profissional_id)
    if profissional is None:
        raise NotFoundError(f"Profissional '{profissional_id}' não encontrado.")
    profissional_repository.delete(db, profissional)
