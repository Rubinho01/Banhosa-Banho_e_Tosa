"""Exceções de domínio.

A camada `services` nunca importa FastAPI/HTTPException diretamente —
isso mantém as regras de negócio testáveis unitariamente, sem precisar
de um contexto HTTP. A camada `api` (routers) é responsável por
capturar essas exceções e traduzi-las para HTTPException (ver
app/main.py, que registra exception handlers globais).
"""


class DomainError(Exception):
    """Classe-base para todas as exceções de domínio da aplicação."""


class NotFoundError(DomainError):
    """Recurso não encontrado (ex.: pet, tutor, profissional, agendamento)."""


class ConflictError(DomainError):
    """Conflito de regra de negócio (ex.: sobreposição de horário — RN-02)."""


class ValidationError(DomainError):
    """Payload/estado inválido segundo uma regra de negócio."""


class InvalidCredentialsError(DomainError):
    """Usuário ou senha inválidos no login."""


class InactiveUserError(DomainError):
    """Usuário autenticado, porém inativo/desabilitado."""
