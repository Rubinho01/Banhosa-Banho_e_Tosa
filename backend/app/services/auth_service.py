from sqlalchemy.orm import Session

from app.core.exceptions import InactiveUserError, InvalidCredentialsError
from app.core.security import create_access_token, verify_password
from app.models.usuario import Usuario
from app.repositories import usuario_repository
from app.schemas.auth import LoginRequest


def authenticate(db: Session, payload: LoginRequest) -> str:
    """Valida usuário/senha e retorna um access token JWT."""
    usuario = usuario_repository.get_by_username(db, payload.username)
    if usuario is None or not verify_password(payload.password, usuario.hashed_password):
        raise InvalidCredentialsError("Usuário ou senha incorretos.")
    if not usuario.active:
        raise InactiveUserError("Usuário desativado. Contate um administrador.")

    return create_access_token(subject=usuario.username)


def get_user_by_username(db: Session, username: str) -> Usuario | None:
    return usuario_repository.get_by_username(db, username)
