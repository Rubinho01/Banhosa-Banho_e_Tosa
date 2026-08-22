"""Fixtures de teste.

Para os testes de API usamos SQLite em memória (via dependency
override de get_db) em vez do PostgreSQL real — mantém a suíte rápida
e sem infraestrutura externa, adequado para um projeto acadêmico. As
regras de negócio (services) são independentes de banco e também têm
testes puramente unitários, sem nenhum fixture de DB.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models import Usuario  # noqa: F401


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture()
def auth_headers(db_session, client):
    """Cria um usuário de teste e retorna os headers já autenticados."""
    usuario = Usuario(username="teste.adm", hashed_password=hash_password("senha123"), active=True)
    db_session.add(usuario)
    db_session.commit()

    response = client.post("/api/v1/auth/login", json={"username": "teste.adm", "password": "senha123"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
