from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.usuario import Usuario


def get_by_username(db: Session, username: str) -> Usuario | None:
    stmt = select(Usuario).where(Usuario.username == username)
    return db.scalars(stmt).first()


def create(db: Session, usuario: Usuario) -> Usuario:
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario
